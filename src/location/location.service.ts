import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './city.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(City)
    private cityRepository: Repository<City>,
  ) {}

  async getAllCities() {
    return this.cityRepository.find({
      select: ['id', 'name'],
      order: {
        name: 'ASC',
      },
    });
  }
}
