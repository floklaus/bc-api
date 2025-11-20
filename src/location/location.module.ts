import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './city.entity';
import { State } from './state.entity';
import { County } from './county.entity';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
    imports: [TypeOrmModule.forFeature([City, State, County])],
    controllers: [LocationController],
    providers: [LocationService],
  })
export class LocationModule {}
