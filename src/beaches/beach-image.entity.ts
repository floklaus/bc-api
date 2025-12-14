import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Beach } from './beach.entity';

@Entity('beach_image')
export class BeachImage extends BaseEntity {

    @ApiProperty({ description: 'The URL of the image' })
    @Column()
    url: string;

    @ApiProperty({ description: 'Whether this is the primary image', default: false })
    @Column({ default: false })
    primary: boolean;

    @ApiProperty({ description: 'Description of the image', required: false })
    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => Beach, (beach) => beach.images)
    beach: Beach;
}
