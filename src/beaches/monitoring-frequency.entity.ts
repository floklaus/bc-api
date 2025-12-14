import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('monitoring_frequency')
export class MonitoringFrequency extends BaseEntity {
    @ApiProperty({ description: 'The description of the monitoring frequency' })
    @Column({ unique: true })
    name: string;
}
