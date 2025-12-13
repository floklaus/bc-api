import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './city.entity';
import { State } from './state.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(City)
    private cityRepository: Repository<City>,
    @InjectRepository(State)
    private stateRepository: Repository<State>,
  ) { }

  async getAllCities(state?: string) {
    const query: any = {
      order: {
        name: 'ASC',
      },
      relations: ['state'],
    };

    if (state) {
      query.where = {
        state: { code: state }
      };
    }

    return this.cityRepository.find(query);
  }

  async getAllStates(active?: boolean) {
    const query: any = {
      order: {
        name: 'ASC',
      },
    };

    if (active !== undefined) {
      query.where = { active };
    }

    return this.stateRepository.find(query);
  }
}
