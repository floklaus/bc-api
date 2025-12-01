import { Module } from '@nestjs/common';
import { MeasurementController } from './measurement.controller';
import { MeasurementService } from './measurement.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Measurement } from './measurement.entity';

@Module({
  controllers: [MeasurementController],
  providers: [MeasurementService],
  imports: [TypeOrmModule.forFeature([Measurement])],
})
export class MeasurementModule { }
