import { Entity, Column, ManyToOne, OneToMany, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/database/base.entity';
import { State } from './state.entity';
import { County } from './county.entity';
import { Beach } from 'src/beaches/beach.entity';

@Entity('city')
@Unique("city_name_code", ["name", "code"])
export class City extends BaseEntity {

  @ApiProperty({ description: 'City name' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'City code' })
  @Column({ unique: true })
  code: string;

  @ApiProperty({ type: () => [Beach], description: 'Beaches in this city' })
  @OneToMany(() => Beach, (beach) => beach.city)
  beaches: Beach[];

  @ApiProperty({ type: () => State, description: 'State the city belongs to' })
  @ManyToOne(() => State, (state) => state.cities)
  state: State;

  @ApiProperty({ type: () => County, description: 'County the city belongs to' })
  @ManyToOne(() => County, (county) => county.cities)
  county: County;
}