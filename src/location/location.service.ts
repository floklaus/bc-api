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
    const query = this.stateRepository.createQueryBuilder('state')
      // Join cities and beaches to count them, but do NOT select them into the entity graph
      // because we are grouping by state.
      .leftJoin('state.cities', 'c')
      .leftJoin('c.beaches', 'b')
      .addSelect('COUNT(b.id)', 'beachCount')
      .groupBy('state.id')
      // Postgres allows grouping by PK to select other columns
      .orderBy('state.name', 'ASC');

    if (active !== undefined) {
      query.where('state.active = :active', { active });
    }

    const raw = await query.getRawAndEntities();

    // Debug raw output
    console.log('Raw beach counts:', raw.raw);

    // Merge raw count into entities
    return raw.entities.map(entity => {
      const rawValue = raw.raw.find(r => r.state_id === entity.id);
      // Ensure we return a plain object with beachCount merged if we can't extend the Entity easily without DTO
      // But since we return the entity, we might need a DTO or just attach it as a property if 'beachCount' exists on entity or we cast it.
      // Let's handle this by returning the raw result mapped to a shape or ensuring the frontend receives it.
      // For simplicity in this codebase, I will append it.
      return {
        ...entity,
        beachCount: rawValue ? parseInt(rawValue.beachCount, 10) : 0
      };
    });
  }
}
