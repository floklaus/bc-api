import { Entity, Column, ManyToOne, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { State } from './state.entity';
import { Beach } from 'src/beaches/beach.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('county')
@Unique('county_name_state', ['name', 'state'])
export class County extends BaseEntity {
    @ApiProperty({ description: 'The name of the county' })
    @Column()
    name: string;

    @ManyToOne(() => State, (state) => state.counties)
    state: State;

    @OneToMany(() => Beach, (beach) => beach.county)
    beaches: Beach[];
}
