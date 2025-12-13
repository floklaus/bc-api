import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MeasurementService } from './measurement.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('measurement')
@ApiTags('measurements')
@UseInterceptors(CacheInterceptor)
export class MeasurementController {
    constructor(private readonly measurementService: MeasurementService) { }

    @Get()
    @ApiOperation({ summary: 'Get all measurements' })
    @ApiResponse({ status: 200, description: 'Return all measurements.' })
    @CacheTTL(300000) // 5 minutes
    findAll() {
        return this.measurementService.findAll();
    }
}
