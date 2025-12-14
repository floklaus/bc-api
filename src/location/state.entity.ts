import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../database/base.entity';
import { County } from './county.entity';
import { StateHistory } from './state-history.entity';
import { Beach } from 'src/beaches/beach.entity';

@Entity('state')
@Unique(['code'])
export class State extends BaseEntity {
    @ApiProperty({ description: 'The name/code of the state/jurisdiction' })
    @Column()
    code: string;

    @ApiProperty({ description: 'The full name of the state/jurisdiction' })
    @Column({ nullable: true })
    name: string;

    @ApiProperty({ description: 'Whether the state/jurisdiction is active' })
    @Column({ default: false })
    active: boolean;

    @OneToMany(() => County, (county) => county.state)
    counties: County[];

    @OneToMany(() => StateHistory, (history) => history.state)
    history: StateHistory[];

    @OneToMany(() => Beach, (beach) => beach.state)
    beaches: Beach[];
}
