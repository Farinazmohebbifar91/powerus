import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FlightSlice } from './flight-slice.entity';

@Entity()
export class Flight {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  origin_name: string;

  @Column()
  destination_name: string;

  @Column()
  departure_date_time_utc: Date;

  @Column()
  arrival_date_time_utc: Date;

  @Column()
  flight_number: string;

  @Column()
  duration: number;

  @OneToMany(() => FlightSlice, (flightSlices) => flightSlices.flight)
  slices: FlightSlice[];
}
