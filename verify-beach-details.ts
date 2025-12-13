import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { Beach } from './src/beaches/beach.entity';
import { Measurement } from './src/measurement/measurement.entity';
import { instanceToPlain } from 'class-transformer';

async function verify() {
    const app = await NestFactory.create(AppModule);

    // Create a beach instance
    const beach = new Beach();
    beach.id = 1;
    beach.name = 'Test Beach';

    const m1 = new Measurement();
    m1.id = 100;
    m1.asOf = new Date();
    m1.viloation = true;
    m1.beach = beach;

    beach.measurements = [m1];

    // Scenario 1: Default Serialization (List View)
    // Should NOT have measurements
    const plainList = instanceToPlain(beach);
    console.log('Scenario 1: List View (Default)');
    console.log('Measurements present:', plainList.measurements !== undefined);

    if (plainList.measurements === undefined) {
        console.log('VERIFICATION PASSED (List View)');
    } else {
        console.log('VERIFICATION FAILED (List View)');
        console.log('Got measurements:', plainList.measurements);
    }

    // Scenario 2: Details View (Group 'beach_details')
    // Should HAVE measurements
    const plainDetails = instanceToPlain(beach, { groups: ['beach_details'] });
    console.log('Scenario 2: Details View (Group beach_details)');
    console.log('Measurements present:', plainDetails.measurements !== undefined);

    if (plainDetails.measurements !== undefined && Array.isArray(plainDetails.measurements)) {
        console.log('VERIFICATION PASSED (Details View)');
        console.log('Measurement count:', plainDetails.measurements.length);
    } else {
        console.log('VERIFICATION FAILED (Details View)');
        console.log('Got:', plainDetails.measurements);
    }

    await app.close();
}

verify();
