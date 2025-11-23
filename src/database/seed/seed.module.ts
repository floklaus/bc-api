import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SeedService } from './seed.service';
import { CsvImportService } from './csv-import.service';
import { Beach } from '../../beaches/beach.entity';
import { City } from '../../location/city.entity';
import { State } from '../../location/state.entity';
import { County } from '../../location/county.entity';
import { Measurement } from '../../measurement/measurement.entity';

import { StateSeeder } from './state.seeder';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT, 5432),
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            synchronize: false, // We don't want to sync in seed, just insert
            entities: [Beach, City, State, County, Measurement],
            autoLoadEntities: true,
        }),
        TypeOrmModule.forFeature([Beach, City, State, County, Measurement]),
    ],
    providers: [SeedService, CsvImportService, StateSeeder],
    exports: [SeedService],
})
export class SeedModule { }
