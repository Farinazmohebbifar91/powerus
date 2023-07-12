import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { URL } from './url.entity';
import { FlightSuggestion } from './flight-suggestion.entity';

@Entity()
export class Reading {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  time: Date;

  @Column()
  urlId: number;

  @OneToOne(() => URL, (url) => url.reading)
  url: URL;

  @OneToMany(
    () => FlightSuggestion,
    (flightSuggestion) => flightSuggestion.reading,
  )
  suggestions: FlightSuggestion[];
}
