import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
import { FlightService } from '../flight.service';

@Injectable()
export class CacheService {
  constructor(
    private httpService: HttpService,
    private flightService: FlightService,
  ) { }

  @Cron(CronExpression.EVERY_10_MINUTES, {
    name: 'update-flight',
    timeZone: 'Europe/Berlin',
  })
  async addFlights() {
    const urls = await this.flightService.getUrls();
    for (const url of urls) {
      try {
        // TODO: this is a simple scheduling mechanism, it can be improved by scheduling each url independently
        // because a very slow url will block the rest of the urls
        // Also, different urls can have different rate limits
        const urlFlights = await this.getFlightDataForUrl(url.address);
        if (!urlFlights) {
          // TODO: for a real application, we need to log the error, and maybe retry sooner than the next scheduled time
          continue;
        }
        await this.saveFlightsToDb(url.id, urlFlights);
      } catch (error) {
        console.log(error);
      }
    }
    console.log(`added flights data to DB`)
    this.flightService.removeOldData();
  }

  private async saveFlightsToDb(urlId: number, flights: any[]) {
    const addedReading = await this.flightService.saveReading({
      time: new Date(),
      urlId: urlId,
    });
    for (const flightSuggestion of flights) {
      const createdSuggestion = await this.flightService.saveSuggestion({
        price: flightSuggestion.price,
        readingId: addedReading.id,
      });
      for (const [index, sliceFlight] of flightSuggestion.slices.entries()) {
        let flight = await this.flightService.getFlight(sliceFlight);
        if (!flight) {
          flight = await this.flightService.saveFlight(sliceFlight);
        }
        await this.flightService.saveSlice({
          flightId: flight.id,
          flightSuggestionId: createdSuggestion.id,
          order: index + 1,
        });
      }
    }
    this.flightService.updateUrl(urlId, addedReading.id);
  }

  private async getFlightDataForUrl(url: string) {
    return lastValueFrom(this.httpService.get(url))
      .then((response) => response.data.flights)
      .catch(() => {
        console.log(`error getting flights from${url}`);
      });
  }
}
