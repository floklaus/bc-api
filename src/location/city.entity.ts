import { Entity, Column, ManyToOne, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { State } from './state.entity';
import { County } from './county.entity';
import { Beach } from 'src/beaches/beach.entity';

@Entity()
@Unique("city_name_code", ["name", "code"])
export class City extends BaseEntity {

  @Column({ unique: true }) 
  name: string;

  @Column({ unique: true }) 
  code: string;

  @OneToMany(() => Beach, (beach) => beach.city)
  beaches: Beach[];

  @ManyToOne(() => State, (state) => state.cities)
  state: State;

  @ManyToOne(() => County, (county) => county.cities)
  county: County;
}