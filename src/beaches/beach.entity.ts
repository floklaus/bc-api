import { Entity, Column, ManyToOne, OneToMany, Unique } from 'typeorm';
import { City } from '../location/city.entity';
import { Measurement } from '../measurement/measurement.entity';
import { BaseEntity } from 'src/database/base.entity';
import { BeachType } from './beach.type';
import { BeachStatus } from './beach.status';

import { Exclude, Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity('beach')
export class Beach extends BaseEntity {

  @ApiProperty({ description: 'The name of the beach' })
  @Column()
  @Unique(['name'])
  name: string;

  @ApiProperty({ description: 'Latitude coordinate' })
  @Column('decimal', { precision: 10, scale: 6 })
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate' })
  @Column('decimal', { precision: 10, scale: 6 })
  longitude: number;



  @ApiProperty({ enum: BeachType, description: 'Type of beach' })
  @Column({
    type: "enum",
    enum: BeachType,
  })
  type: BeachType;

  // Transient property, not stored in DB
  asOf?: Date;

  @ApiProperty({ enum: BeachStatus, description: 'Current status of the beach', nullable: true })
  @Expose()
  get status(): BeachStatus | null {
    if (!this.measurements) {
      return BeachStatus.OPEN;
    }

    const today = this.asOf ? new Date(this.asOf) : new Date();
    const measurement = this.measurements.find(m => {
      const mDate = new Date(m.asOf);
      return mDate.toISOString().split('T')[0] === today.toISOString().split('T')[0];
    });

    if (!measurement) {
      return BeachStatus.OPEN;
    }

    return measurement.viloation ? BeachStatus.CLOSED : BeachStatus.OPEN;
  }

  @ApiProperty({ type: () => City, description: 'City the beach belongs to' })
  @ManyToOne(() => City, (city) => city.beaches)
  city: City;

  @ApiProperty({ type: () => [Measurement], description: 'Measurements for the beach' })
  @OneToMany(() => Measurement, (measurement) => measurement.beach)
  @Transform(({ value, options }) => {
    if (options?.groups?.includes('beach_details')) {
      return value;
    }
    return undefined;
  })
  measurements: Measurement[];
}