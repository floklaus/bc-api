import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { BeachesService } from './src/beaches/beaches.service';
import { DataSource } from 'typeorm';
import { Beach } from './src/beaches/beach.entity';
import { City } from './src/location/city.entity';
import { State } from './src/location/state.entity';
import { BeachType } from './src/beaches/beach.type';
import { Measurement } from './src/measurement/measurement.entity';
import { ReasonType } from './src/measurement/reason.type';

async function verify() {
    const app = await NestFactory.create(AppModule);
    const beachesService = app.get(BeachesService);
    const dataSource = app.get(DataSource);
    const beachRepo = dataSource.getRepository(Beach);
    const cityRepo = dataSource.getRepository(City);
    const stateRepo = dataSource.getRepository(State);
    const measurementRepo = dataSource.getRepository(Measurement);

    // Setup test data
    // Need a state 'MA' and 'NY'
    let ma = await stateRepo.findOne({ where: { code: 'MA' } });
    if (!ma) {
        ma = new State();
        ma.name = 'Massachusetts';
        ma.code = 'MA';
        await stateRepo.save(ma);
    }

    let ny = await stateRepo.findOne({ where: { code: 'NY' } });
    if (!ny) {
        ny = new State();
        ny.name = 'New York';
        ny.code = 'NY';
        await stateRepo.save(ny);
    }

    // Need cities
    let boston = await cityRepo.findOne({ where: { name: 'Boston' } });
    if (!boston) {
        boston = new City();
        boston.name = 'Boston';
        boston.code = 'BOS';
    }
    boston.state = ma; // Ensure state is linked
    await cityRepo.save(boston);

    let nyc = await cityRepo.findOne({ where: { name: 'New York City' } });
    if (!nyc) {
        nyc = new City();
        nyc.name = 'New York City';
        nyc.code = 'NYC';
    }
    nyc.state = ny; // Ensure state is linked
    await cityRepo.save(nyc);

    // Create beaches
    let b1 = await beachRepo.findOne({ where: { name: 'Boston Beach' } });
    if (!b1) {
        b1 = new Beach();
        b1.name = 'Boston Beach';
        b1.latitude = 1;
        b1.longitude = 1;
        b1.city = boston;
        b1.type = BeachType.MARINE;
        await beachRepo.save(b1);
    } else {
        b1.city = boston; // Ensure city is linked
        await beachRepo.save(b1);
    }

    let b2 = await beachRepo.findOne({ where: { name: 'NYC Beach' } });
    if (!b2) {
        b2 = new Beach();
        b2.name = 'NYC Beach';
        b2.latitude = 1;
        b2.longitude = 1;
        b2.city = nyc;
        b2.type = BeachType.MARINE;
        await beachRepo.save(b2);
    } else {
        b2.city = nyc; // Ensure city is linked
        await beachRepo.save(b2);
    }

    // Create measurement for b1 on 2021-01-01 (Violation)
    // Check if exists first to avoid unique constraint error
    let m1 = await measurementRepo.findOne({
        where: {
            beach: { id: b1.id },
            asOf: new Date('2021-01-01T12:00:00Z')
        }
    });

    if (!m1) {
        m1 = new Measurement();
        m1.asOf = new Date('2021-01-01T12:00:00Z');
        m1.year = 2021;
        m1.indicatorLevel = 100;
        m1.reason = ReasonType.ECOLI;
        m1.viloation = true;
        m1.beach = b1;
        await measurementRepo.save(m1);
    }

    console.log('Test Data Created');

    // Test State Filter
    console.log('Testing State Filter (MA)...');
    const maBeaches = await beachesService.findAll({ state: 'MA' });
    console.log(`Found ${maBeaches.length} beaches in MA`);
    const foundBoston = maBeaches.find(b => b.name === 'Boston Beach');
    if (maBeaches.length > 0 && foundBoston) {
        console.log('VERIFICATION PASSED (State Filter)');
    } else {
        console.log('VERIFICATION FAILED (State Filter)');
    }

    // Test City Filter
    console.log('Testing City Filter (New York City)...');
    const nycBeaches = await beachesService.findAll({ city: 'New York City' });
    console.log(`Found ${nycBeaches.length} beaches in NYC`);
    if (nycBeaches.length === 1 && nycBeaches[0].name === 'NYC Beach') {
        console.log('VERIFICATION PASSED (City Filter)');
    } else {
        console.log('VERIFICATION FAILED (City Filter)');
    }

    // Test asOf Filter (Status Calculation)
    console.log('Testing asOf Filter (2021-01-01)...');
    const asOfBeaches = await beachesService.findAll({ state: 'MA', asOf: '2021-01-01' });
    const b1Found = asOfBeaches.find(b => b.name === 'Boston Beach');
    console.log('Boston Beach found:', !!b1Found);
    if (b1Found) {
        console.log('Measurements count:', b1Found.measurements?.length);
        if (b1Found.measurements?.length > 0) {
            const m = b1Found.measurements[0];
            console.log('Measurement asOf:', m.asOf, 'Type:', typeof m.asOf);
            console.log('Target Date:', b1Found.asOf);

            const mDate = new Date(m.asOf);
            const targetDate = new Date(b1Found.asOf);
            console.log('Comparison:', mDate.toISOString().split('T')[0], '===', targetDate.toISOString().split('T')[0]);
        }
    }
    const b1Status = b1Found?.status;
    console.log('Status on 2021-01-01:', b1Status);

    // Should be CLOSED because of violation
    if (b1Status === 'Closed') {
        console.log('VERIFICATION PASSED (asOf Filter)');
    } else {
        console.log('VERIFICATION FAILED (asOf Filter)');
        console.log('Expected: Closed, Got:', b1Status);
    }

    // Cleanup (optional, but good practice)
    await measurementRepo.delete(m1.id);
    await beachRepo.delete(b1.id);
    await beachRepo.delete(b2.id);
    // Don't delete cities/states as they might be used by others or unique constraint issues if re-run

    await app.close();
}

verify();
