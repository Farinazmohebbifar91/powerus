import { Controller, Get } from '@nestjs/common';
import { FlightService } from './flight.service';
import { sub } from 'date-fns';

@Controller('flight')
export class FlightController {
  constructor(private flightService: FlightService) {}

  @Get()
  async getFlights() {
    const urls = await this.flightService.getUrls();
    const lastValidReadingIds = urls
      .filter(
        (url) =>
          url.lastReadingId &&
          url.reading.time >= sub(new Date(), { hours: 1 }),
      )
      .map((url) => url.lastReadingId);
    const flights = await this.flightService.getFlightsForClient(
      lastValidReadingIds,
    );
    return { flights };
  }
}
