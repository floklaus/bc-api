import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Logger } from '@nestjs/common';
import { BeachesService } from './beaches.service';
import { Beach } from './beach.entity';
//import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('beaches')
//@UseGuards(JwtAuthGuard)
export class BeachesController {
  private readonly logger = new Logger(BeachesController.name);

  constructor(private readonly beachesService: BeachesService) { }

  @Get()
  findAll() {
    this.logger.log('Fetching all beaches');
    return this.beachesService.findAll();
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