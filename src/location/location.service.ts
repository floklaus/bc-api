import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from './state.entity';

@Injectable()
export class LocationService {
    private readonly logger = new Logger(LocationService.name);

    constructor(
        @InjectRepository(State)
        private stateRepository: Repository<State>,
    ) { }

    async getStates(active?: boolean): Promise<State[]> {
        const query = this.stateRepository.createQueryBuilder('state')
            .orderBy('state.name', 'ASC');
        if (active) {
            query.where('state.active = :active', { active: true });
        }
        return query.getMany();
    }
}
