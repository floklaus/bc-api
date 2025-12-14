import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { State } from './state.entity';
import { BaseEntity } from '../database/base.entity';

@Entity()
@Unique(['state', 'year'])
export class StateHistory extends BaseEntity {

    @ApiProperty({ description: 'The year of the data' })
    @Column()
    year: number;

    @ApiProperty({ type: () => State, description: 'The state' })
    @ManyToOne(() => State, (state) => state.history)
    state: State;
}
