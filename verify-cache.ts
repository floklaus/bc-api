import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { BeachesService } from './src/beaches/beaches.service';
import { MeasurementService } from './src/measurement/measurement.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

async function verify() {
    const app = await NestFactory.create(AppModule);
    const cacheManager = app.get<Cache>(CACHE_MANAGER);

    // We can't easily test the interceptor without making HTTP requests.
    // So we will use supertest to make requests to the app.

    const request = require('supertest');
    const server = app.getHttpServer();

    await app.init();

    console.log('Testing Beaches Caching...');
    const start1 = Date.now();
    await request(server).get('/beaches');
    const end1 = Date.now();
    console.log(`First request took ${end1 - start1}ms`);

    const start2 = Date.now();
    await request(server).get('/beaches');
    const end2 = Date.now();
    console.log(`Second request took ${end2 - start2}ms`);

    // Check if cache key exists (default key generation is usually URL based)
    // The default key for GET /beaches is likely '/beaches'
    const beachCache = await cacheManager.get('/beaches');
    if (beachCache) {
        console.log('Cache hit for /beaches: YES');
    } else {
        console.log('Cache hit for /beaches: NO (might be key mismatch or not cached)');
        // Try to list keys if possible, but cache-manager doesn't always support it easily depending on store
    }

    console.log('Testing Measurements Caching...');
    const start3 = Date.now();
    await request(server).get('/measurement');
    const end3 = Date.now();
    console.log(`First request took ${end3 - start3}ms`);

    const start4 = Date.now();
    await request(server).get('/measurement');
    const end4 = Date.now();
    console.log(`Second request took ${end4 - start4}ms`);

    const measurementCache = await cacheManager.get('/measurement');
    if (measurementCache) {
        console.log('Cache hit for /measurement: YES');
    } else {
        console.log('Cache hit for /measurement: NO');
    }

    if (beachCache && measurementCache) {
        console.log('VERIFICATION PASSED: Both endpoints are cached');
    } else {
        console.log('VERIFICATION FAILED: One or both endpoints are not cached');
    }

    await app.close();
}

verify();
