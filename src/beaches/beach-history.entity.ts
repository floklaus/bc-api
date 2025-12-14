import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Beach } from './beach.entity';
import { MonitoringFrequency } from './monitoring-frequency.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('beach_history')
export class BeachHistory {

    @ApiProperty({ description: 'The unique ID of the beach' })
    @PrimaryColumn()
    beachId: number;

    @ApiProperty({ description: 'The year of the record' })
    @PrimaryColumn({ type: 'int' })
    year: number;

    @ApiProperty({ description: 'Tier' })
    @Column({ nullable: true, type: 'int' })
    tier: number;

    @ApiProperty({ description: 'Beach Length (MI)' })
    @Column({ nullable: true, type: 'decimal', precision: 10, scale: 3 })
    beachLength: number;

    @ApiProperty({ description: 'Number of days in Swim Season' })
    @Column({ nullable: true, type: 'int' })
    daysInSeason: number;

    @ApiProperty({ description: 'Number of hours in Swim Season Day' })
    @Column({ nullable: true, type: 'int' })
    hoursInSeason: number;

    @ApiProperty({ description: 'Swim Season Start Date' })
    @Column({ nullable: true, type: 'date' })
    seasonStart: Date;

    @ApiProperty({ description: 'Swim Season End Date' })
    @Column({ nullable: true, type: 'date' })
    seasonEnd: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    readonly createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    readonly updatedAt!: Date;

    // Relations

    @ManyToOne(() => Beach)
    @JoinColumn({ name: 'beachId' })
    beach: Beach;

    @ApiProperty({ type: () => MonitoringFrequency, description: 'Swim Season Monitoring Frequency' })
    @ManyToOne(() => MonitoringFrequency)
    monitorFrequency: MonitoringFrequency;

    @ApiProperty({ description: 'Swim Season Monitoring Frequency Amount' })
    @Column({ nullable: true, type: 'int' })
    monitorFrequencyAmount: number;

    @ApiProperty({ type: () => MonitoringFrequency, description: 'Off Season Monitoring Frequency' })
    @ManyToOne(() => MonitoringFrequency)
    monitorFrequencyOffSeason: MonitoringFrequency;

    @ApiProperty({ description: 'Off Season Monitoring Frequency Amount' })
    @Column({ nullable: true, type: 'int' })
    monitorFrequencyOffSeasonAmount: number;
}
