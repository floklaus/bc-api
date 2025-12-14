import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { State } from './state.entity';
import { StateHistory } from './state-history.entity';
import { County } from './county.entity';
import { LocationService } from './location.service';
import { StatesController } from './states.controller';

@Module({
    imports: [TypeOrmModule.forFeature([State, StateHistory, County])],
    providers: [LocationService],
    controllers: [StatesController],
    exports: [LocationService],
})
export class LocationModule { }
