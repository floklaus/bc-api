import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { Beach } from './src/beaches/beach.entity';
import { Measurement } from './src/measurement/measurement.entity';
import { BeachStatus } from './src/beaches/beach.status';
import { instanceToPlain } from 'class-transformer';

async function verify() {
    const app = await NestFactory.create(AppModule);

    // Create a beach instance
    const beach = new Beach();
    beach.id = 1;
    beach.name = 'Test Beach';

    // Create a measurement for today
    const m1 = new Measurement();
    m1.asOf = new Date();
    m1.viloation = true;
    m1.beach = beach;

    beach.measurements = [m1];

    // Serialize
    const plain1 = instanceToPlain(beach);
    console.log('Scenario 1: Violation Today');
    console.log('Status:', plain1.status);
    console.log('Measurements present:', plain1.measurements !== undefined);

    if (plain1.status === BeachStatus.CLOSED && plain1.measurements === undefined) {
        console.log('VERIFICATION PASSED (Scenario 1)');
    } else {
        console.log('VERIFICATION FAILED (Scenario 1)');
        console.log('Expected Status: Closed, Got:', plain1.status);
        console.log('Expected Measurements: undefined, Got:', plain1.measurements);
    }

    // Scenario 2: No Violation Today
    const m2 = new Measurement();
    m2.asOf = new Date();
    m2.viloation = false;
    m2.beach = beach;
    beach.measurements = [m2];

    const plain2 = instanceToPlain(beach);
    console.log('Scenario 2: No Violation Today');
    console.log('Status:', plain2.status);

    if (plain2.status === BeachStatus.OPEN) {
        console.log('VERIFICATION PASSED (Scenario 2)');
    } else {
        console.log('VERIFICATION FAILED (Scenario 2)');
        console.log('Expected Status: Open, Got:', plain2.status);
    }

    // Scenario 3: No Measurement Today
    const m3 = new Measurement();
    m3.asOf = new Date('2000-01-01');
    m3.viloation = true;
    m3.beach = beach;
    beach.measurements = [m3];

    const plain3 = instanceToPlain(beach);
    console.log('Scenario 3: No Measurement Today');
    console.log('Status:', plain3.status);

    if (plain3.status === null) {
        console.log('VERIFICATION PASSED (Scenario 3)');
    } else {
        console.log('VERIFICATION FAILED (Scenario 3)');
        console.log('Expected Status: null, Got:', plain3.status);
    }

    await app.close();
}

verify();
