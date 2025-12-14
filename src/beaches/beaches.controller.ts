import { Controller, Get, Post, Put, Delete, Param, Body, Logger, UseInterceptors, SerializeOptions, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { BeachesService } from './beaches.service';
import { Beach } from './beach.entity';

@Controller('beaches')
@ApiTags('beaches')
@UseInterceptors(CacheInterceptor)
export class BeachesController {
  private readonly logger = new Logger(BeachesController.name);

  constructor(private readonly beachesService: BeachesService) { }

  @Get()
  @ApiOperation({ summary: 'Get all beaches' })
  @ApiResponse({ status: 200, description: 'Return all beaches.' })
  @ApiQuery({ name: 'state', required: false, description: 'Filter by state code (e.g. MA)' })

  @ApiQuery({ name: 'asOf', required: false, description: 'Date to calculate status for (YYYY-MM-DD)' })
  @CacheTTL(300000) // 5 minutes
  async findAll(
    @Query('state') state?: string,
    @Query('asOf') asOf?: string,
  ) {
    const beaches = await this.beachesService.findAll({ state, asOf });
    this.logger.log(`Fetching all beaches ${beaches?.length}`);
    return beaches;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a beach by id' })
  @ApiResponse({ status: 200, description: 'Return a beach.' })
  @SerializeOptions({ groups: ['beach_details'] })
  findOne(@Param('id') id: number) {
    this.logger.log(`Fetching beach with id: ${id}`);
    return this.beachesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a beach' })
  create(@Body() beach: Partial<Beach>) {
    return this.beachesService.create(beach);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a beach' })
  update(@Param('id') id: number, @Body() beach: Partial<Beach>) {
    return this.beachesService.update(id, beach);
  }
}