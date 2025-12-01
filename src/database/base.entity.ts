import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;


  @CreateDateColumn({ type: 'timestamptz' })
  @Exclude()
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @Exclude()
  readonly updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  @Exclude()
  deletedAt!: Date;
}