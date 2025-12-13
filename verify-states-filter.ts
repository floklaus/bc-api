import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { LocationService } from './src/location/location.service';

async function verify() {
    const app = await NestFactory.create(AppModule);
    const locationService = app.get(LocationService);

    console.log('Testing GET /states (all states)...');
    const allStates = await locationService.getAllStates();
    console.log(`Found ${allStates.length} states total`);

    console.log('\nTesting GET /states?active=true (only active states)...');
    const activeStates = await locationService.getAllStates(true);
    console.log(`Found ${activeStates.length} active states`);

    if (activeStates.length === 1 && activeStates[0].code === 'MA') {
        console.log('VERIFICATION PASSED (Only MA is active)');
    } else {
        console.log('VERIFICATION FAILED (Expected only MA to be active)');
        console.log('Active states:', activeStates.map(s => s.code));
    }

    console.log('\nTesting GET /states?active=false (only inactive states)...');
    const inactiveStates = await locationService.getAllStates(false);
    console.log(`Found ${inactiveStates.length} inactive states`);

    const hasMA = inactiveStates.some(s => s.code === 'MA');
    if (!hasMA && inactiveStates.length === allStates.length - 1) {
        console.log('VERIFICATION PASSED (MA not in inactive states)');
    } else {
        console.log('VERIFICATION FAILED (MA should not be in inactive states)');
    }

    await app.close();
}

verify();
