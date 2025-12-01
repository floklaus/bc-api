import { Controller, Get, Post, Put, Delete, Param, Body, Logger, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { BeachesService } from './beaches.service';
import { Beach } from './beach.entity';

@Controller('beaches')
@UseInterceptors(CacheInterceptor)
export class BeachesController {
  private readonly logger = new Logger(BeachesController.name);

  constructor(private readonly beachesService: BeachesService) { }

  @Get()
  @CacheTTL(300000) // 5 minutes
  async findAll() {
    const beaches = await this.beachesService.findAll();
    this.logger.log(`Fetching all beaches ${beaches?.length}`);
    return beaches;
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    this.logger.log(`Fetching beach with id: ${id}`);
    return this.beachesService.findOne(id);
  }

  @Post()
  create(@Body() beach: Partial<Beach>) {
    return this.beachesService.create(beach);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() beach: Partial<Beach>) {
    return this.beachesService.update(id, beach);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.beachesService.delete(id);
  }

  @Post(':id/geocode')
  updateCoordinates(@Param('id') id: number) {
    return this.beachesService.updateBeachCoordinates(id);
  }

  @Post('geocode/all')
  updateAllCoordinates() {
    return this.beachesService.updateAllBeachCoordinates();
  }
}