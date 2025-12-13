import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { LocationService } from './src/location/location.service';

async function verify() {
    const app = await NestFactory.create(AppModule);
    const locationService = app.get(LocationService);

    console.log('Testing GET /states...');
    const allStates = await locationService.getAllStates();
    console.log(`Found ${allStates.length} states total`);

    if (allStates.length > 0) {
        console.log('Sample state:', allStates[0]);

        // Find MA
        const ma = allStates.find(s => s.code === 'MA');
        if (ma) {
            console.log('\nMassachusetts state:', ma);
            if (ma.active === true) {
                console.log('VERIFICATION PASSED (MA is active)');
            } else {
                console.log('VERIFICATION FAILED (MA should be active)');
            }
        } else {
            console.log('VERIFICATION FAILED (MA not found)');
        }

        // Check that other states are not active
        const otherActiveStates = allStates.filter(s => s.code !== 'MA' && s.active === true);
        if (otherActiveStates.length === 0) {
            console.log('VERIFICATION PASSED (Only MA is active)');
        } else {
            console.log(`VERIFICATION FAILED (${otherActiveStates.length} other states are active)`);
            console.log('Active states:', otherActiveStates.map(s => s.code));
        }
    } else {
        console.log('VERIFICATION FAILED (No states found)');
    }

    await app.close();
}

verify();
