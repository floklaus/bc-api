import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BeachAction } from './beach-action.entity';

@Entity('beach_indicator')
export class BeachIndicator extends BaseEntity {
    @ApiProperty({ description: 'The unique code of the indicator (e.g. ENTERO)' })
    @Column({ unique: true })
    code: string;

    @ApiProperty({ description: 'The full name of the indicator' })
    @Column()
    name: string;

    @ApiProperty({ description: 'Description of the indicator' })
    @Column({ nullable: true })
    description: string;

    @ManyToMany(() => BeachAction, (action) => action.indicators)
    actions: BeachAction[];
}
