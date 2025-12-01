import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { MeasurementService } from './measurement.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('measurement')
@UseInterceptors(CacheInterceptor)
export class MeasurementController {
    constructor(private readonly measurementService: MeasurementService) { }

    @Get()
    @CacheTTL(300000) // 5 minutes
    findAll() {
        return this.measurementService.findAll();
    }
}
