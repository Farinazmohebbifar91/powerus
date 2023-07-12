import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Flight } from './flight.entity';
import { FlightSuggestion } from './flight-suggestion.entity';

@Entity()
export class FlightSlice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  flightId: number;

  @Column()
  flightSuggestionId: number;

  @Column()
  order: number;

  @ManyToOne(() => Flight, (flight) => flight.slices)
  @JoinColumn({
    name: 'flightId',
  })
  flight: Flight;

  @ManyToOne(
    () => FlightSuggestion,
    (flightSuggestion) => flightSuggestion.slices,
  )
  @JoinColumn({
    name: 'flightSuggestionId',
  })
  flightSuggestion: FlightSuggestion;
}
