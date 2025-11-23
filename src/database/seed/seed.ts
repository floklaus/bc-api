import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('Seed');

    try {
        const appContext = await NestFactory.createApplicationContext(SeedModule);

        const seedService = appContext.get(SeedService);
        await seedService.seed();

        await appContext.close();
        logger.log('Seeding complete!');
    } catch (error) {
        logger.error('Seeding failed', error);
        process.exit(1);
    }
}

bootstrap();
