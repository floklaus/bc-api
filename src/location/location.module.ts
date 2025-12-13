import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './city.entity';
import { State } from './state.entity';
import { County } from './county.entity';
import { CityController } from './city.controller';
import { StatesController } from './states.controller';
import { LocationService } from './location.service';

@Module({
  imports: [TypeOrmModule.forFeature([City, State, County])],
  controllers: [CityController, StatesController],
  providers: [LocationService],
})
export class LocationModule { }
