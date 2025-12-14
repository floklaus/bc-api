import { Entity, Column, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { Beach } from './beach.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('waterbody')
@Unique(['name'])
export class Waterbody extends BaseEntity {
    @ApiProperty({ description: 'The name of the waterbody' })
    @Column()
    name: string;

    @ApiProperty({ description: 'Type of waterbody', required: false })
    @Column({ nullable: true })
    type: string;

    @OneToMany(() => Beach, (beach) => beach.waterbody)
    beaches: Beach[];
}
