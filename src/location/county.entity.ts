import { Entity, Column, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { City } from './city.entity';

@Entity('county')
@Unique("county_name_code", ["name", "code"])
export class County extends BaseEntity {

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: string;

  @OneToMany(() => City, (city) => city.state)
  cities: City[];
}