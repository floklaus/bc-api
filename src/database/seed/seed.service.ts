import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CsvImportService } from './csv-import.service';
import { StateSeeder } from './state.seeder';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedService {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly csvImportService: CsvImportService,
        private readonly stateSeeder: StateSeeder,
    ) { }

    async seed() {
        this.logger.log('Starting seeding process...');
        await this.stateSeeder.seed();

        const tables = await this.dataSource.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        this.logger.log('Tables in DB: ' + JSON.stringify(tables));

        await this.seedBeaches();
        this.logger.log('Seeding process completed.');
    }

    private async seedBeaches() {
        this.logger.log('Seeding beaches from CSV files...');
        const dataDir = path.join(process.cwd(), 'data');

        if (!fs.existsSync(dataDir)) {
            this.logger.warn(`Data directory not found at ${dataDir}`);
            return;
        }

        const files = fs.readdirSync(dataDir);
        const csvFiles = files.filter(file => file.match(/^[A-Z]{2}-\d{4}\.csv$/));

        for (const file of csvFiles) {
            const match = file.match(/^([A-Z]{2})-(\d{4})\.csv$/);
            if (match) {
                const state = match[1];
                const year = parseInt(match[2], 10);
                this.logger.log(`Importing ${file} (State: ${state}, Year: ${year})...`);
                try {
                    await this.csvImportService.importCsv(state, year);
                    this.logger.log(`Successfully imported ${file}`);
                } catch (error) {
                    this.logger.error(`Failed to import ${file}:`, error);
                }
            }
        }
    }
}
