import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Measurement } from './measurement.entity';

@Injectable()
export class MeasurementService {
    constructor(
        @InjectRepository(Measurement)
        private measurementRepository: Repository<Measurement>,
    ) { }

    findAll() {
        return this.measurementRepository.find({ relations: ['beach'] });
    }
}
