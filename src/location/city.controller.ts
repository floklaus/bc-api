import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LocationService } from './location.service';

@Controller('cities')
@ApiTags('cities')
export class CityController {
  private readonly logger = new Logger(CityController.name);

  constructor(private readonly locationService: LocationService) { }

  @Get()
  @ApiOperation({ summary: 'Get all cities' })
  @ApiResponse({ status: 200, description: 'Return all cities.' })
  @ApiQuery({ name: 'state', required: false, description: 'Filter by state code (e.g. MA)' })
  async getAllCities(@Query('state') state?: string) {
    this.logger.log(`Fetching all cities${state ? ` for state: ${state}` : ''}`);
    return this.locationService.getAllCities(state);
  }
}
