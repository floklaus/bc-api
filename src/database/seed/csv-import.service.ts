import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beach } from 'src/beaches/beach.entity';
import { City } from 'src/location/city.entity';
import { State } from 'src/location/state.entity';
import { County } from 'src/location/county.entity';
import { Measurement } from 'src/measurement/measurement.entity';
import { BeachType } from 'src/beaches/beach.type';
import { ReasonType } from 'src/measurement/reason.type';

@Injectable()
export class CsvImportService {
    private readonly logger = new Logger(CsvImportService.name);

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
    ) { }

    private async geocodeAddress(address: string, city: string, state: string): Promise<{ lat: number; lng: number } | null> {
        try {
            const fullAddress = `${address}, ${city}, ${state}, USA`;
            const encodedAddress = encodeURIComponent(fullAddress);
            const apiKey = process.env.GOOGLE_MAPS_API_KEY;

            if (!apiKey) {
                this.logger.error('GOOGLE_MAPS_API_KEY is not defined');
                return null;
            }

            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK' && data.results && data.results.length > 0) {
                const location = data.results[0].geometry.location;
                return {
                    lat: location.lat,
                    lng: location.lng
                };
            } else {
                this.logger.error(`Geocoding failed for ${address}: ${data.status} - ${data.error_message || ''}`);
            }

            return null;
        } catch (error) {
            this.logger.error(`Error geocoding address ${address}:`, error);
            return null;
        }
    }

    async importCsv(state: string, year: number): Promise<any[]> {

        const basePath = "./data"

        const filePath = `${basePath}/${state}-${year}.csv`;

        const stateModel = await this.stateRepository.findOneBy({ name: state });

        const results = [];
        const stream = fs.createReadStream(filePath).pipe(csv());

        for await (const data of stream) {
            results.push(data);

            //county
            let county = await this.countyRepository.findOne({
                where: [
                    { code: data["County Code"] },
                    { name: data["County Description"] }
                ]
            });

            if (!county) {
                county = new County();
            }
            county.name = data["County Description"];
            county.code = data["County Code"];
            await this.countyRepository.save(county);

            //city
            let city = await this.cityRepository.findOne({
                where: [
                    { code: data["Community Code"] },
                    { name: data["Community"] }
                ]
            });

            if (!city) {
                city = new City();
            }
            city.county = county;
            city.name = data["Community"];
            city.code = data["Community Code"];
            city.state = stateModel;

            await this.cityRepository.save(city);

            // Check if beach already exists
            let existingBeach = await this.beachesRepository.findOne({
                where: { name: data["Beach Name"] }
            });

            // Only geocode if beach doesn't exist or has placeholder coordinates
            let coordinates = null;
            if (!existingBeach || (existingBeach.latitude === 1 && existingBeach.longitude === 1)) {
                coordinates = await this.geocodeAddress(
                    data["Beach Name"],
                    data["Community"],
                    state
                );
                // Rate limiting: Google Maps has higher limits
                // await new Promise(resolve => setTimeout(resolve, 100));
            }

            let beach = existingBeach;
            if (!beach) {
                beach = new Beach();
            }
            beach.name = data["Beach Name"];
            beach.type = Object.entries(BeachType).find(([key, value]) => value === data["Beach Type Description"])?.[1];
            beach.latitude = coordinates?.lat ?? existingBeach?.latitude ?? 1;
            beach.longitude = coordinates?.lng ?? existingBeach?.longitude ?? 1;
            beach.city = city;

            await this.beachesRepository.save(beach);

            const measurement = new Measurement();
            measurement.asOf = new Date(data["Sample Date"]);
            measurement.year = parseInt(data["Year"]);
            measurement.reason = Object.entries(ReasonType).find(([key, value]) => value === data["Organism"])?.[1];
            measurement.indicatorLevel = parseInt(data["Indicator Level"]);
            measurement.viloation = data["Violation"] === "Yes" ? true : false;
            measurement.beach = beach;

            await this.measurementRepository.upsert(measurement, ['asOf', 'beach', 'indicatorLevel']);
        }

        return results;
    }
}
