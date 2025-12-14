import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Beach } from './beach.entity';


@Injectable()
export class BeachesService {
  constructor(
    @InjectRepository(Beach)
    private beachesRepository: Repository<Beach>,
  ) { }

  private readonly logger = new Logger(BeachesService.name);

  async findAll(filters?: { state?: string; asOf?: string }) {
    const where: any = {
      latitude: Not(IsNull()),
      longitude: Not(IsNull()),
    };

    if (filters?.state) {
      where.state = { code: filters.state }; // state code or name? CSV uses "AL", "AK".
      // Usually matching by code or name. Assuming 'code' in State entity is the code/name used in CSV.
    }

    const beaches = await this.beachesRepository.find({
      where,
      relations: ['state', 'county', 'waterbody', 'access', 'images']
    });

    // ... (rest of logic for status calculation if any)

    if (filters?.asOf) {
      const asOfDate = new Date(filters.asOf);
      beaches.forEach(beach => {
        beach.asOf = asOfDate;
      });
    }

    return beaches;
  }

  async findOne(id: number) {
    const beach = await this.beachesRepository.findOne({
      where: { id },
      relations: ['state', 'county', 'waterbody', 'access', 'images', 'actions', 'actions.indicators'],
      order: {
        actions: {
          startDate: 'DESC'
        }
      }
    });

    if (beach && beach.actions) {
      const uniqueActionsMap = new Map();

      beach.actions.forEach(action => {
        const dateKey = new Date(action.startDate).toDateString();
        const existing = uniqueActionsMap.get(dateKey);

        if (!existing) {
          uniqueActionsMap.set(dateKey, action);
        } else {
          // Compare existing vs current
          // Prefer current if it has duration and existing does not
          const currentHasDuration = action.durationDays && action.durationDays > 0;
          const existingHasDuration = existing.durationDays && existing.durationDays > 0;

          if (currentHasDuration && !existingHasDuration) {
            uniqueActionsMap.set(dateKey, action);
          }
        }
      });

      // Convert back to array and sort by date desc
      beach.actions = Array.from(uniqueActionsMap.values())
        .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }

    return beach;
  }

  create(beach: Partial<Beach>) {
    return this.beachesRepository.save(beach);
  }

  async update(id: number, beach: Partial<Beach>) {
    await this.beachesRepository.update(id, beach);
    return this.findOne(id);
  }

  delete(id: number) {
    return this.beachesRepository.delete(id);
  }
}