import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LocationService } from './location.service';

@Controller('states')
@ApiTags('states')
export class StatesController {
    private readonly logger = new Logger(StatesController.name);

    constructor(private readonly locationService: LocationService) { }

    @Get()
    @ApiOperation({ summary: 'Get all states' })
    @ApiResponse({ status: 200, description: 'Return all states.' })
    @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filter by active status' })
    async getAllStates(@Query('active') active?: string) {
        const activeFilter = active === 'true' ? true : active === 'false' ? false : undefined;
        this.logger.log(`Fetching all states${activeFilter !== undefined ? ` (active: ${activeFilter})` : ''}`);
        return this.locationService.getAllStates(activeFilter);
    }
}
