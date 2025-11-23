import { Module } from '@nestjs/common';
import { CsvImportService } from './csv.import.service';
import { CsvImportController } from './csv.import.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beach } from 'src/beaches/beach.entity';
import { City } from 'src/location/city.entity';
import { State } from 'src/location/state.entity';
import { County } from 'src/location/county.entity';
import { Measurement } from 'src/measurement/measurement.entity';

@Module({
  providers: [CsvImportService],
  controllers: [CsvImportController],
  imports: [TypeOrmModule.forFeature([Beach, City, State, County, Measurement])],
  exports: [CsvImportService],
})
export class ImportModule { }
