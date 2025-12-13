import { Entity, Column, ManyToOne, OneToMany, Index, Unique } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/database/base.entity';
import { ReasonType } from './reason.type';
import { Beach } from 'src/beaches/beach.entity';

@Entity('measurement')
@Unique("measurement_asOf_beach", ["asOf", "beach", "indicatorLevel"])
export class Measurement extends BaseEntity {

  @ApiProperty({ description: 'Date of measurement' })
  @Column({ type: 'date' })
  asOf: Date;

  @ApiProperty({ description: 'Year of measurement' })
  @Column()
  @Index()
  year: number;

  @ApiProperty({ enum: ReasonType, description: 'Reason for measurement' })
  @Column({
    type: "enum",
    enum: ReasonType,
  })
  reason: ReasonType;

  @ApiProperty({ description: 'Indicator level' })
  @Column()
  indicatorLevel: number;

  @ApiProperty({ description: 'Violation status' })
  @Column()
  viloation: boolean;


  @ApiProperty({ type: () => Beach, description: 'Beach associated with measurement' })
  @ManyToOne(() => Beach, (beach) => beach.measurements)
  @Exclude()
  beach: Beach;
}