import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { Beach } from './beach.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('beach_action')
export class BeachAction extends BaseEntity {

    @ApiProperty({ description: 'The type of action (e.g. Advisory, Closure)' })
    @Column()
    actionType: string;

    @ApiProperty({ description: 'Reasons for the action' })
    @Column({ nullable: true })
    actionReasons: string;

    @ApiProperty({ description: 'Start date of the action' })
    @Column({ type: 'timestamp' })
    startDate: Date;

    @ApiProperty({ description: 'End date of the action' })
    @Column({ type: 'timestamp' })
    endDate: Date;

    @ApiProperty({ description: 'Year of the action' })
    @Column({ type: 'int' })
    year: number;

    @ManyToOne(() => Beach, (beach) => beach.actions)
    beach: Beach;
}
