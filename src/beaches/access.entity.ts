import { Entity, Column, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { Beach } from './beach.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('access')
@Unique(['name'])
export class Access extends BaseEntity {
    @ApiProperty({ description: 'Access type name' })
    @Column()
    name: string;

    @OneToMany(() => Beach, (beach) => beach.access)
    beaches: Beach[];
}
