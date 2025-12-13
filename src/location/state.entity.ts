import { Entity, Column, ManyToOne, OneToMany, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/database/base.entity';
import { City } from './city.entity';

@Entity('state')
@Unique("state_name_code", ["name", "code"])
export class State extends BaseEntity {

  @ApiProperty({ description: 'State name' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'State code (2-letter abbreviation)' })
  @Column({ unique: true })
  code: string;

  @ApiProperty({ description: 'Whether the state is active', default: false })
  @Column({ default: false })
  active: boolean;

  @ApiProperty({ type: () => [City], description: 'Cities in this state' })
  @OneToMany(() => City, (city) => city.state)
  cities: City[];
}