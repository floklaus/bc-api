import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BeaconService } from './beacon.service';
import { StateSeeder } from './state.seeder';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedService {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly beaconService: BeaconService,
        private readonly stateSeeder: StateSeeder,
    ) { }

    async seed() {
        this.logger.log('Starting seeding process...');

        // Clear all data first to start fresh (includes states now)
        await this.beaconService.clearData();

        await this.stateSeeder.seed();

        const tables = await this.dataSource.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        this.logger.log('Tables in DB: ' + JSON.stringify(tables));

        await this.seedBeaches();
        this.logger.log('Seeding process completed.');
    }

    private async seedBeaches() {
        this.logger.log('Seeding beaches from EPA BEACON API...');
        try {
            // clearData is already called in seed()
            await this.beaconService.importBeaches();
            this.logger.log('Successfully imported beaches from API');
        } catch (error) {
            this.logger.error('Failed to import beaches from API:', error);
        }
    }
}
