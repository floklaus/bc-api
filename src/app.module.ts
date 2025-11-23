import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeachesModule } from './beaches/beaches.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ImportModule } from './import/import.module';
import { LocationModule } from './location/location.module';
import { MeasurementModule } from './measurement/measurement.module';

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
      synchronize: false,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      migrationsRun: true,
      migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
    }),
    BeachesModule,
    AuthModule,
    ImportModule,
    LocationModule,
    MeasurementModule,
  ],
})
export class AppModule { }
