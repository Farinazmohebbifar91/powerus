import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reading } from './reading.entity';

@Entity()
export class URL {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column({
    nullable: true,
  })
  lastReadingId: number;

  @OneToOne(() => Reading, (reading) => reading.url)
  @JoinColumn({
    name: 'lastReadingId',
  })
  reading: Reading;
}
