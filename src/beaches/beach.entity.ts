import { Entity, Column, OneToMany, ManyToOne, Unique } from 'typeorm';

import { BaseEntity } from 'src/database/base.entity';
import { BeachType } from './beach.type';
import { BeachStatus } from './beach.status';
import { BeachAction } from './beach-action.entity';
import { State } from '../location/state.entity';
import { County } from '../location/county.entity';
import { Waterbody } from './waterbody.entity';
import { Access } from './access.entity';
import { BeachImage } from './beach-image.entity';

import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity('beach')
@Unique(['externalId'])
export class Beach extends BaseEntity {

  @ApiProperty({ description: 'The name of the beach' })
  @Column()
  name: string;

  @ApiProperty({ description: 'The unique ID of the beach' })
  @Column({ name: 'external_id' }) // Explicit DB column name helps clarity
  externalId: string;

  @ApiProperty({ type: () => State, description: 'State/Jurisdiction' })
  @ManyToOne(() => State, (state) => state.beaches)
  state: State;

  @ApiProperty({ type: () => County, description: 'County' })
  @ManyToOne(() => County, (county) => county.beaches)
  county: County;

  @ApiProperty({ type: () => Waterbody, description: 'Waterbody' })
  @ManyToOne(() => Waterbody, (wb) => wb.beaches)
  waterbody: Waterbody;

  @ApiProperty({ type: () => Access, description: 'Access type' })
  @ManyToOne(() => Access, (access) => access.beaches)
  access: Access;

  @ApiProperty({ description: 'Tier' })
  @Column({ nullable: true, type: 'int' })
  tier: number;

  @ApiProperty({ description: 'Beach Length (MI)' })
  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 3 })
  beachLength: number;

  @ApiProperty({ description: 'Beach Owner' })
  @Column({ nullable: true })
  owner: string;

  @ApiProperty({ description: 'Latitude coordinate' })
  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate' })
  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  longitude: number;

  @ApiProperty({ description: 'AI Summary of the beach', required: false })
  @Column({ type: 'text', nullable: true })
  summary: string;

  @ApiProperty({ type: () => [BeachImage], description: 'Images of the beach' })
  @OneToMany(() => BeachImage, (image) => image.beach)
  images: BeachImage[];

  @ApiProperty({ enum: BeachType, description: 'Type of beach' })
  @Column({
    type: "enum",
    enum: BeachType,
    nullable: true
  })
  type: BeachType;

  // Transient property, not stored in DB
  asOf?: Date;

  @ApiProperty({ enum: BeachStatus, description: 'Current status of the beach', nullable: true })
  @Expose()
  get status(): BeachStatus | null {
    if (!this.actions) {
      // If actions are not loaded, we can't determine status accurately from them.
      // Fallback logic or default OPEN.
      // However, strictly speaking, without actions check, we might assume Open.
      return BeachStatus.OPEN;
    }

    // Check for active advisories/closures
    const today = this.asOf ? new Date(this.asOf) : new Date();
    const activeAction = this.actions.find(a => {
      const start = new Date(a.startDate);
      const end = new Date(a.endDate);
      return today >= start && today <= end;
    });

    if (activeAction) {
      return BeachStatus.CLOSED;
    }

    return BeachStatus.OPEN;
  }

  @OneToMany(() => BeachAction, (action) => action.beach)
  actions: BeachAction[];


}