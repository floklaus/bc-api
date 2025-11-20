import { Module } from '@nestjs/common';
import { BeachesService } from './beaches.service';
import { BeachesController } from './beaches.controller';
import { Beach } from './beach.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [BeachesService],
  controllers: [BeachesController],
  imports: [TypeOrmModule.forFeature([Beach])],
})
export class BeachesModule {}
