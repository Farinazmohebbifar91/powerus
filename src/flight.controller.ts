import { Controller, Get } from '@nestjs/common';
import { FlightService } from './flight.service';

@Controller('flight')
export class FlightController {
  constructor(private flightService: FlightService) {}

  @Get()
  async getFlights() {
    const lastValidReadingIds = await this.flightService.getLastValidReadingIds();
    const flights = await this.flightService.getFlightsForClient(
      lastValidReadingIds,
    );
    return { flights };
  }
}
