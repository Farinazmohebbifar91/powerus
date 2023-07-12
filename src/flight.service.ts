import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import * as _ from 'lodash';
import { FlightSuggestion } from './entities/flight-suggestion.entity';
import { URL } from './entities/url.entity';
import { Reading } from './entities/reading.entity';
import { Flight } from './entities/flight.entity';
import { FlightSlice } from './entities/flight-slice.entity';
import { FlightLike } from './models/flight.interface';
import { FlightSuggestionLike } from './models/flight-suggestion.interface';
import { ReadingLike } from './models/reading.interface';
import { sub } from 'date-fns';

@Injectable()
export class FlightService {
  constructor(
    @InjectRepository(FlightSuggestion)
    private flightSuggestion: Repository<FlightSuggestion>,
    @InjectRepository(URL) private urlRepository: Repository<URL>,
    @InjectRepository(Reading) private readingRepository: Repository<Reading>,
    @InjectRepository(Flight) private flightRepository: Repository<Flight>,
    @InjectRepository(FlightSuggestion)
    private flightSuggestionRepository: Repository<FlightSuggestion>,
    @InjectRepository(FlightSlice)
    private flightSliceRepository: Repository<FlightSlice>,
  ) {}

  getUrls() {
    return this.urlRepository.find({
      join: {
        alias: 'url',
        leftJoinAndSelect: {
          reading: 'url.reading',
        },
      },
    });
  }

  updateUrl(id: number, lastReadingId: number) {
    this.urlRepository.update({ id: id }, { lastReadingId });
  }

  async getFlightsForClient(validReadingIds: number[]) {
    const flightSuggestions = await this.flightSuggestion.find({
      where: {
        readingId: In(validReadingIds),
      },
      join: {
        alias: 'flightSuggestion',
        innerJoinAndSelect: {
          slices: 'flightSuggestion.slices',
          flight: 'slices.flight',
        },
      },
      order:{
        slices: {
          order: 'ASC'
        }
      }
    });
    return flightSuggestions.map((suggestion) => {
      return {
        slices: suggestion.slices.map((slice) => {
          return {
            origin_name: slice.flight.origin_name,
            destination_name: slice.flight.destination_name,
            departure_date_time_utc: slice.flight.departure_date_time_utc,
            arrival_date_time_utc: slice.flight.arrival_date_time_utc,
            flight_number: slice.flight.flight_number,
            duration: slice.flight.duration,
          };
        }),
        price: suggestion.price,
      };
    });
  }

  async getLastValidReadingIds() {
    const urls = await this.getUrls();
    return urls
      .filter(
        (url) =>
          url.lastReadingId &&
          url.reading.time >= sub(new Date(), { hours: 1 }),
      )
      .map((url) => url.lastReadingId);
  }

  async getFlight(flight: FlightLike) {
    return this.flightRepository.findOne({
      where: {
        flight_number: flight.flight_number,
        departure_date_time_utc: new Date(flight.departure_date_time_utc),
        arrival_date_time_utc: new Date(flight.arrival_date_time_utc),
      },
    });
  }

  saveFlight(flight: FlightLike) {
    return this.flightRepository.save(flight);
  }

  saveSlice(slice) {
    return this.flightSliceRepository.save(slice);
  }

  saveSuggestion(flightSuggestion: FlightSuggestionLike) {
    return this.flightSuggestionRepository.save(flightSuggestion);
  }

  saveReading(reading: ReadingLike) {
    return this.readingRepository.save(reading);
  }

  private async getExpiredSuggestionIds() {
    const expiredsuggestions = await this.flightSuggestionRepository.find({
      where: {
        reading: { time: LessThanOrEqual(sub(new Date(), { hours: 1 })) },
      },
    });
    return expiredsuggestions.map((suggestion) => suggestion.id);
  }

  async removeOldData() {
    const expiredSuggestionIds = await this.getExpiredSuggestionIds();
    await this.flightSliceRepository.delete({
      flightSuggestionId: In(expiredSuggestionIds),
    });
    const deletedSuggestions = await this.flightSuggestionRepository.delete({
      id: In(expiredSuggestionIds),
    });
    // TODO: delete all flights not used in any slices
    // TODO: delete old readings. Also might need to set lastReadingId to null for the related URL
    // if it does not have any newer readings
    return deletedSuggestions;
  }
}
