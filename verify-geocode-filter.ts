import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { BeachesService } from './src/beaches/beaches.service';
import { DataSource } from 'typeorm';
import { Beach } from './src/beaches/beach.entity';
import { City } from './src/location/city.entity';
import { BeachType } from './src/beaches/beach.type';

async function verify() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const beachesService = app.get(BeachesService);
    const dataSource = app.get(DataSource);
    const beachRepo = dataSource.getRepository(Beach);
    const cityRepo = dataSource.getRepository(City);

    // Setup test data
    const city = await cityRepo.findOne({ where: {} });
    if (!city) {
        console.log('No city found, cannot run test');
        await app.close();
        return;
    }

    // Create beach with (1, 1)
    const beach1 = new Beach();
    beach1.name = 'Test Beach 1';
    beach1.latitude = 1;
    beach1.longitude = 1;
    beach1.city = city;
    beach1.type = BeachType.MARINE;
    await beachRepo.save(beach1);

    // Create beach with (42, -70)
    const beach2 = new Beach();
    beach2.name = 'Test Beach 2';
    beach2.latitude = 42;
    beach2.longitude = -70;
    beach2.city = city;
    beach2.type = BeachType.MARINE;
    await beachRepo.save(beach2);

    console.log('Created test beaches');

    try {
        // Run update
        console.log('Running updateAllBeachCoordinates...');
        // We expect this to only process beach1
        // We can't easily spy on the internal query, but we can check the logs or the result count
        // The method returns { updated, failed }
        // Total processed should be 1 (only beach1)
        // Note: existing beaches in DB might also match (1, 1) if seeding ran and left them at default.
        // So we should count how many (1, 1) beaches there are BEFORE running.

        const countBefore = await beachRepo.count({ where: { latitude: 1, longitude: 1 } });
        console.log(`Beaches with (1, 1) before: ${countBefore}`);

        const result = await beachesService.updateAllBeachCoordinates();
        console.log('Result:', result);

        const totalProcessed = result.updated + result.failed;
        console.log(`Total processed: ${totalProcessed}`);

        if (totalProcessed === countBefore) {
            console.log('VERIFICATION PASSED: Processed count matches count of beaches with (1, 1)');
        } else {
            console.log(`VERIFICATION FAILED: Processed ${totalProcessed}, expected ${countBefore}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        // Cleanup
        await beachRepo.delete(beach1.id);
        await beachRepo.delete(beach2.id);
        await app.close();
    }
}

verify();
