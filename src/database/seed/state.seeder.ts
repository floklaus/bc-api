import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StateSeeder {
    private readonly logger = new Logger(StateSeeder.name);

    constructor(private readonly dataSource: DataSource) { }

    async seed() {
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
}
