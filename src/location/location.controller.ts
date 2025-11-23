import { Controller, Get, Logger } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('locations')
export class LocationController {
  private readonly logger = new Logger(LocationController.name);

  constructor(private readonly locationService: LocationService) { }

  @Get('cities')
  async getAllCities() {
    this.logger.log('Fetching all cities');
    return this.locationService.getAllCities();
  }
}
