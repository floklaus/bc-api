import { Module } from '@nestjs/common';
import { BeachesService } from './beaches.service';
import { BeachesController } from './beaches.controller';
import { Beach } from './beach.entity';
import { BeachAction } from './beach-action.entity';
import { State } from '../location/state.entity';
import { County } from '../location/county.entity';
import { Waterbody } from './waterbody.entity';
import { Access } from './access.entity';
import { BeachHistory } from './beach-history.entity';
import { MonitoringFrequency } from './monitoring-frequency.entity';
import { BeachImage } from './beach-image.entity';
import { StateHistory } from '../location/state-history.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [BeachesService],
  controllers: [BeachesController],
  imports: [TypeOrmModule.forFeature([Beach, BeachAction, State, County, Waterbody, Access, BeachHistory, MonitoringFrequency, BeachImage, StateHistory])],
})
export class BeachesModule { }
