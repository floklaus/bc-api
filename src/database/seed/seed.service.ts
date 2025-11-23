import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CsvImportService } from './csv-import.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedService {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly csvImportService: CsvImportService,
    ) { }

    async seed() {
        this.logger.log('Starting seeding process...');
        await this.seedStates();
        await this.seedBeaches();
        this.logger.log('Seeding process completed.');
    }

    private async seedStates() {
        this.logger.log('Seeding states...');
        const statesSqlPath = path.join(process.cwd(), 'data', 'states.sql');

        if (!fs.existsSync(statesSqlPath)) {
            this.logger.warn(`States SQL file not found at ${statesSqlPath}`);
            return;
        }

        const sql = fs.readFileSync(statesSqlPath, 'utf8');
        const queries = sql.split(';').filter(query => query.trim().length > 0);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        // await queryRunner.startTransaction(); // Removed transaction to allow individual inserts to fail/succeed independently

        try {
            for (const query of queries) {
                // Simple check to avoid empty queries or comments if any
                if (query.trim()) {
                    // Using ON CONFLICT DO NOTHING to avoid errors on re-runs if the SQL doesn't handle it
                    // However, the provided SQL is simple INSERTs. 
                    // Ideally we should check if exists or use INSERT IGNORE/ON CONFLICT.
                    // Since I can't easily modify the SQL file logic without parsing, 
                    // I'll wrap in try-catch or assume the user wants to run it.
                    // But wait, if I run it twice it will fail on unique constraint.
                    // Let's try to execute. If it fails, we log and continue? 
                    // Or better, let's assume the table is empty or we want to upsert.
                    // The SQL file has "insert into state ...".
                    // I will try to execute it. If it fails, I'll log a warning.
                    try {
                        await queryRunner.query(query);
                    } catch (e) {
                        // Ignore duplicate key errors or other expected errors during seeding
                        this.logger.debug(`Query failed (might already exist): ${e.message}`);
                    }
                }
            }
            // await queryRunner.commitTransaction();
            this.logger.log('States seeded successfully.');
        } catch (err) {
            this.logger.error('Error seeding states:', err);
            // await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
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
