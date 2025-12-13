import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { LocationService } from './src/location/location.service';

async function verify() {
    const app = await NestFactory.create(AppModule);
    const locationService = app.get(LocationService);

    console.log('Testing GET /cities (all cities)...');
    const allCities = await locationService.getAllCities();
    console.log(`Found ${allCities.length} cities total`);
    if (allCities.length > 0) {
        console.log('Sample city:', allCities[0]);
        console.log('VERIFICATION PASSED (All Cities)');
    } else {
        console.log('VERIFICATION FAILED (All Cities) - No cities found');
    }

    console.log('\nTesting GET /cities?state=MA...');
    const maCities = await locationService.getAllCities('MA');
    console.log(`Found ${maCities.length} cities in MA`);
    if (maCities.length > 0) {
        console.log('Sample MA city:', maCities[0]);
        // Verify all cities are in MA
        const allInMA = maCities.every(city => city.state?.code === 'MA');
        if (allInMA) {
            console.log('VERIFICATION PASSED (State Filter)');
        } else {
            console.log('VERIFICATION FAILED (State Filter) - Not all cities are in MA');
        }
    } else {
        console.log('VERIFICATION FAILED (State Filter) - No MA cities found');
    }

    await app.close();
}

verify();
