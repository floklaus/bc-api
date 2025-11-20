import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CsvImportService } from './csv.import.service';

@Controller('import')
@UseGuards(JwtAuthGuard)
export class CsvImportController {
  constructor(private readonly csvImportService: CsvImportService) {}

  @Put(':state/:year')
  import(@Param('state') state: string, @Param('year') year: number) {
    return this.csvImportService.importCsv(state, year);
  }
}