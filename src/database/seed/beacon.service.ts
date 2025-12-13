
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Beach } from 'src/beaches/beach.entity';
import { City } from 'src/location/city.entity';
import { State } from 'src/location/state.entity';
import { County } from 'src/location/county.entity';
import { Measurement } from 'src/measurement/measurement.entity';
import { BeachStatus } from 'src/beaches/beach.status';
import { ReasonType } from 'src/measurement/reason.type';
import { BeachType } from 'src/beaches/beach.type';

@Injectable()
export class BeaconService {
    private readonly logger = new Logger(BeaconService.name);
    private readonly BASE_URL = 'https://watersgeo.epa.gov/arcgis/rest/services/OWPROGRAM/BEACON_NAD83/MapServer/1/query';

    constructor(
        @InjectRepository(Beach)
        private beachesRepository: Repository<Beach>,
        @InjectRepository(City)
        private cityRepository: Repository<City>,
        @InjectRepository(State)
        private stateRepository: Repository<State>,
        @InjectRepository(County)
        private countyRepository: Repository<County>,
        @InjectRepository(Measurement)
        private measurementRepository: Repository<Measurement>,
        private dataSource: DataSource,
    ) { }


    async clearData(): Promise<void> {
        this.logger.warn('Clearing existing beach data...');

        // Ensure enum has Unknown
        try {
            await this.beachesRepository.query("ALTER TYPE measurement_reason_enum ADD VALUE 'Unknown'");
        } catch (e) {
            // Ignore if already exists or fails (e.g. if type doesn't exist yet but sync handles it, unlikely here)
            this.logger.debug('Could not add Unknown to enum (might exist): ' + e.message);
        }

        // Use TRUNCATE CASCADE to clear data while respecting/handling FKs
        await this.dataSource.query('TRUNCATE TABLE measurement, beach, city, county RESTART IDENTITY CASCADE');
        this.logger.log('Data cleared.');
    }

    async importBeaches(): Promise<void> {
        this.logger.log('Starting import from EPA BEACON API...');

        // Ensure data is clean? No, let the caller decide. 
        // Actually, let's call it here if we assume this is a full re-seed.
        // But usually seeders are additive. 
        // Given the broken state, I will manually call it in seed service (or here).

        const features = await this.fetchBeaches();
        this.logger.log(`Processing ${features.length} features...`);

        // Cache states
        const states = await this.stateRepository.find();
        const stateMap = new Map(states.map(s => [s.code, s]));

        let successCount = 0;
        let failCount = 0;

        for (const feature of features) {
            try {
                await this.processFeature(feature, stateMap);
                successCount++;
            } catch (error) {
                // Log simplified error
                this.logger.error(`Failed to process feature ${feature.attributes.BEACH_NAME}: ${error.message}`);
                failCount++;
            }
        }

        this.logger.log(`Import completed. Success: ${successCount}, Failed: ${failCount}`);
    }

    private async processFeature(feature: any, stateMap: Map<string, State>) {
        const attr = feature.attributes;
        const geometry = feature.geometry;

        if (!attr.BEACH_NAME || !attr.STATE_CODE) {
            return;
        }

        const state = stateMap.get(attr.STATE_CODE);
        if (!state) return;

        // Scoped Names
        const countyName = attr.COUNTY_NAME || 'Unknown County';
        const countyFips = attr.COUNTY_FIPS_CODE || '00000';

        // County is unique by code?
        let county = await this.countyRepository.findOne({
            where: { code: countyFips }
        });

        if (!county) {
            county = new County();
            county.name = countyName;
            county.code = countyFips;
            await this.countyRepository.save(county);
        }

        // Placeholder City
        // Name must be unique globally. "Lincoln County Beaches (OR)"
        const cityName = `${countyName} Beaches (${state.code})`;
        const cityCode = `${countyFips}-PLACEHOLDER`;

        let city = await this.cityRepository.findOne({
            where: { name: cityName }
        });

        if (!city) {
            city = new City();
            city.name = cityName;
            city.code = cityCode;
            city.state = state;
            city.county = county;
            try {
                await this.cityRepository.save(city);
            } catch (e) {
                // If code conflict?
                city = await this.cityRepository.findOne({ where: { name: cityName } });
                if (!city) throw e;
            }
        }

        // Beach
        // Name must be unique globally? 
        // "Main Beach (MA)"
        const beachName = `${attr.BEACH_NAME} (${state.code})`;

        let beach = await this.beachesRepository.findOne({
            where: { name: beachName }
        });

        if (!beach) {
            beach = new Beach();
            beach.name = beachName;
        }

        if (geometry && geometry.paths && geometry.paths.length > 0 && geometry.paths[0].length > 0) {
            const point = geometry.paths[0][0];
            beach.longitude = point[0];
            beach.latitude = point[1];
        }

        beach.city = city;
        // Default to MARINE as API doesn't provide type and it's required
        beach.type = BeachType.MARINE;

        await this.beachesRepository.save(beach);

        // Measurement
        if (attr.DATE_VALUE) {
            const measurement = new Measurement();
            measurement.asOf = new Date(attr.DATE_VALUE);
            measurement.year = measurement.asOf.getFullYear();

            measurement.viloation = (attr.STATUS === 1 || attr.STATUS === 2);
            measurement.indicatorLevel = attr.STATUS;
            measurement.beach = beach;
            measurement.reason = ReasonType.UNKNOWN;

            await this.measurementRepository.upsert(measurement, ['asOf', 'beach', 'indicatorLevel']);
        }
    }

    async fetchBeaches(): Promise<any[]> {
        const allFeatures = [];
        let offset = 0;
        const recordCount = 1000;
        let hasMore = true;

        while (hasMore) {
            try {
                const params = new URLSearchParams({
                    where: '1=1',
                    outFields: 'BEACH_NAME,BEACH_ID,STATUS,DATE_VALUE,STATE_CODE,COUNTY_NAME,COUNTY_FIPS_CODE',
                    f: 'json',
                    returnGeometry: 'true',
                    resultOffset: offset.toString(),
                    resultRecordCount: recordCount.toString(),
                });

                const response = await fetch(`${this.BASE_URL}?${params.toString()}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch beaches: ${response.statusText}`);
                }

                const data = await response.json();

                if (data.error) {
                    throw new Error(`API Error: ${JSON.stringify(data.error)}`);
                }

                const features = data.features || [];
                allFeatures.push(...features);

                if (features.length < recordCount) {
                    hasMore = false;
                } else {
                    offset += recordCount;
                    this.logger.log(`Fetched ${allFeatures.length} beaches so far...`);
                }
            } catch (error) {
                this.logger.error('Error fetching beaches from API', error);
                throw error;
            }
        }

        this.logger.log(`Total beaches fetched: ${allFeatures.length}`);
        return allFeatures;
    }
}
