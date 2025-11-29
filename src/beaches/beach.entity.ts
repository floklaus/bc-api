import { Entity, Column, ManyToOne, OneToMany, Unique } from 'typeorm';
import { City } from '../location/city.entity';
import { Measurement } from '../measurement/measurement.entity';
import { BaseEntity } from 'src/database/base.entity';
import { BeachType } from './beach.type';

@Entity('beach')
export class Beach extends BaseEntity {

  @Column()
  @Unique(['name'])
  name: string;

  @Column('decimal', { precision: 10, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6 })
  longitude: number;



  @Column({
    type: "enum",
    enum: BeachType,
  })
  type: BeachType;


  @ManyToOne(() => City, (city) => city.beaches)
  city: City;

  @OneToMany(() => Measurement, (measurement) => measurement.beach)
  measurements: Measurement[];
}