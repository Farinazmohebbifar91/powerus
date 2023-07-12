import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FlightSlice } from './flight-slice.entity';
import { Reading } from './reading.entity';

@Entity()
export class FlightSuggestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  price: number;

  @Column()
  readingId: number;

  @ManyToOne(() => Reading, (reading) => reading.suggestions)
  reading: Reading;

  @OneToMany(() => FlightSlice, (flightSlices) => flightSlices.flightSuggestion)
  slices: FlightSlice[];
}
