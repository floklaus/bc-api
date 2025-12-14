import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('StatesController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/states (GET)', () => {
        return request(app.getHttpServer())
            .get('/states')
            .expect(200)
            .expect((res) => {
                // Expect array
                if (!Array.isArray(res.body)) throw new Error('Response is not an array');
                // Expect at least MA
                const ma = res.body.find((s) => s.code === 'MA');
                if (!ma) throw new Error('MA state not found');
                if (ma.active !== true) throw new Error('MA should be active');
            });
    });

    it('/states?activeOnly=true (GET)', () => {
        return request(app.getHttpServer())
            .get('/states?activeOnly=true')
            .expect(200)
            .expect((res) => {
                if (!Array.isArray(res.body)) throw new Error('Response is not an array');
                // Check if all are active
                const inactive = res.body.find((s) => s.active === false);
                if (inactive) throw new Error('Found inactive state when activeOnly=true');
            });
    });
});
