import { Controller, Get } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('cities')
  async getAllCities() {
    console.log('Fetching all cities');
    return this.locationService.getAllCities();
  }
}
