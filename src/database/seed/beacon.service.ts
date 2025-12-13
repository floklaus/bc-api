
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
        await this.dataSource.query('TRUNCATE TABLE measurement, beach, city, county, state RESTART IDENTITY CASCADE');
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
        const countyName = `${attr.COUNTY_NAME || 'Unknown County'} (${attr.STATE_CODE})`;
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
            where: { code: cityCode }
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

        // Populate Summary if missing
        if (!beach.summary) {
            beach.summary = this.generateSyntheticSummary(beach.name, state.name);
            await this.beachesRepository.save(beach);
        }

        // Measurement
        const measurementsToSave: Measurement[] = [];
        if (attr.DATE_VALUE) {
            const currentMeasurement = new Measurement();
            currentMeasurement.asOf = new Date(attr.DATE_VALUE);
            currentMeasurement.year = currentMeasurement.asOf.getFullYear();

            currentMeasurement.viloation = (attr.STATUS === 1 || attr.STATUS === 2);
            currentMeasurement.indicatorLevel = attr.STATUS;
            currentMeasurement.beach = beach;
            currentMeasurement.reason = ReasonType.UNKNOWN;

            measurementsToSave.push(currentMeasurement);
        }

        // Generate synthetic history for the last 30 days
        const today = new Date();
        for (let i = 1; i <= 30; i++) { // Start from 1 day ago
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            // Random status: mostly open (0), sometimes closed (1 or 2)
            // Let's say 10% chance of closure
            const isClosed = Math.random() < 0.1;
            const status = isClosed ? (Math.random() < 0.5 ? 1 : 2) : 0; // 1: Advisory, 2: Closed

            const historyMeasurement = new Measurement();
            historyMeasurement.asOf = date;
            historyMeasurement.year = date.getFullYear();
            historyMeasurement.viloation = isClosed;
            historyMeasurement.indicatorLevel = status;
            historyMeasurement.beach = beach;
            historyMeasurement.reason = isClosed ? ReasonType.UNKNOWN : ReasonType.UNKNOWN; // Or could be null? But we use UNKNOWN.

            measurementsToSave.push(historyMeasurement);
        }

        // Bulk save/upsert
        // We iterate and save individually or use upsert. 
        // Upsert on date+beach is safest.
        for (const m of measurementsToSave) {
            await this.measurementRepository.upsert(m, ['asOf', 'beach']);
        }
    }

    private generateSyntheticSummary(name: string, state: string): string {
        const sands = ['golden sand', 'white powder sand', 'rugged pebble', 'coarse sand', 'soft beige sand'];
        const waves = ['gentle waves', 'calm waters', 'moderate surf', 'rolling swells', 'energetic waves'];
        const parking = ['ample street parking', 'large private lot ($)', 'limited public parking', 'metered street spots', 'free municipal lot'];
        const activities = [
            'perfect for building sandcastles',
            'great for morning jogs',
            'ideal for sunbathing',
            'popular for volleyball',
            'excellent for snorkeling'
        ];
        const food = ['nearby boardwalk fries', 'local seafood shacks', 'convenient snack bars', 'picnic areas with grills', 'upscale dining nearby'];
        const vibes = ['family-friendly', 'secluded and romantic', 'bustling and energetic', 'peaceful and serene', 'rugged and natural'];

        const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
        const pickCount = (arr: string[], count: number) => {
            const shuffled = [...arr].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        };

        const sand = pick(sands);
        const wave = pick(waves);
        const park = pick(parking);
        const activityList = pickCount(activities, 2).join(' and ');
        const foodOption = pick(food);
        const vibe = pick(vibes);

        return `
**Overview**
${name} is a ${vibe} destination in ${state}, featuring beautiful ${sand} and ${wave}. It is a favorite spot for locals and tourists alike.

**Amenities & Convenience**
- **Parking**: ${park}
- **Food**: ${foodOption}
- **Family**: Playgrounds available nearby

**Activities**
Visitors usually find this beach ${activityList}. Don't forget to pack sunscreen!
        `.trim();
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
