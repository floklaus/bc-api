import { Entity, Column, ManyToOne, OneToMany, Index, Unique } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { ReasonType } from './reason.type';
import { Beach } from 'src/beaches/beach.entity';

@Entity('measurement')
@Unique("measurement_asOf_beach", ["asOf", "beach", "indicatorLevel"])
export class Measurement extends BaseEntity {

  @Column({ type: 'date' })
  asOf: Date;

  @Column()
  @Index()
  year: number;

  @Column({
    type: "enum",
    enum: ReasonType,
  })
  reason: ReasonType;

  @Column()
  indicatorLevel: number;

  @Column()
  viloation: boolean;


  @ManyToOne(() => Beach, (beach) => beach.measurements)
  beach: Beach;
}