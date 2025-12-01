import { Entity, Column, ManyToOne, OneToMany, Unique } from 'typeorm';
import { City } from '../location/city.entity';
import { Measurement } from '../measurement/measurement.entity';
import { BaseEntity } from 'src/database/base.entity';
import { BeachType } from './beach.type';
import { BeachStatus } from './beach.status';

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

  // Transient property, not stored in DB
  asOf?: Date;

  get status(): BeachStatus | null {
    if (!this.asOf || !this.measurements) {
      return null;
    }

    const measurement = this.measurements.find(m => {
      const mDate = new Date(m.asOf);
      const targetDate = new Date(this.asOf);
      return mDate.toISOString().split('T')[0] === targetDate.toISOString().split('T')[0];
    });

    if (!measurement) {
      return null;
    }

    return measurement.viloation ? BeachStatus.CLOSED : BeachStatus.OPEN;
  }

  @ManyToOne(() => City, (city) => city.beaches)
  city: City;

  @OneToMany(() => Measurement, (measurement) => measurement.beach)
  measurements: Measurement[];
}