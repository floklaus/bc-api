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

  findOne(id: number) {
    return this.beachesRepository.findOne({
      where: { id },
      relations: ['state', 'county', 'waterbody', 'access', 'images']
    });
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