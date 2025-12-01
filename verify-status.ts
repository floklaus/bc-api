import { DataSource } from 'typeorm';
import { Beach } from './src/beaches/beach.entity';
import { Measurement } from './src/measurement/measurement.entity';
import { City } from './src/location/city.entity';
import { State } from './src/location/state.entity';
import { County } from './src/location/county.entity';
import { BeachStatus } from './src/beaches/beach.status';
import 'dotenv/config';

async function verify() {
    const AppDataSource = new DataSource({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [Beach, Measurement, City, State, County],
        synchronize: false,
    });

    await AppDataSource.initialize();

    try {
        const beachRepo = AppDataSource.getRepository(Beach);

        // Find a beach with measurements
        const beach = await beachRepo.findOne({
            where: {},
            relations: ['measurements']
        });

        if (!beach) {
            console.log('No beach found to verify');
            return;
        }

        console.log('Beach found:', beach.name);

        // Filter for a measurement that actually exists
        const m = beach.measurements.find(m => m);

        if (m) {
            console.log('Measurement found for date:', m.asOf, 'Violation:', m.viloation);

            // Test exact date match
            beach.asOf = new Date(m.asOf);
            console.log('Testing with date:', beach.asOf);
            console.log('Calculated Status:', beach.status);

            const expectedStatus = m.viloation ? BeachStatus.CLOSED : BeachStatus.OPEN;

            if (beach.status === expectedStatus) {
                console.log('VERIFICATION PASSED');
            } else {
                console.log('VERIFICATION FAILED');
                console.log('Expected:', expectedStatus);
                console.log('Got:', beach.status);
            }

            // Test date mismatch
            const otherDate = new Date('2000-01-01');
            beach.asOf = otherDate;
            console.log('Testing with mismatch date:', otherDate);
            if (beach.status === null) {
                console.log('VERIFICATION PASSED (Mismatch)');
            } else {
                console.log('VERIFICATION FAILED (Mismatch). Expected null, got:', beach.status);
            }

        } else {
            console.log('No measurements found for this beach');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await AppDataSource.destroy();
    }
}

verify();
