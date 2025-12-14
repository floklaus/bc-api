import { Controller, Get, Logger, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { LocationService } from './location.service';
import { State } from './state.entity';

@Controller('states')
@ApiTags('states')
@UseInterceptors(CacheInterceptor)
export class StatesController {
    private readonly logger = new Logger(StatesController.name);

    constructor(private readonly locationService: LocationService) { }

    @Get()
    @ApiOperation({ summary: 'Get all states' })
    @ApiResponse({ status: 200, description: 'Return all states.' })
    @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filter by active status' })
    @CacheTTL(3600000) // 1 hour (states don't change often)
    async findAll(@Query('active') active?: boolean): Promise<State[]> {
        // Query param activeOnly comes as string "true"/"false" usually in express/nestjs unless transformed
        // We'll let NestJS handle simple transformation or cast it manually if needed.
        // NestJS primitive types in Query can be tricky without `ParseBoolPipe` or `ValidationPipe` with `transform`.
        // I will interpret string 'true' manually to be safe if pipes aren't established globally.
        const isActive = active === true || String(active) === 'true';

        // If specific activeOnly param wasn't provided, maybe we default to all? 
        // User asked "only MA as active", implying we might only want to SHOW active ones by default? 
        // I'll stick to 'return all' if not specified, but support filter.

        return this.locationService.getStates(isActive);
    }
}
