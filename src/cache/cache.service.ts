import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
import { FlightService } from 'src/flight.service';
import { UrlLike } from 'src/models/url.interface';

@Injectable()
export class CacheService {
  constructor(
    private httpService: HttpService,
    private flightService: FlightService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES, {
    name: 'update-flight',
    timeZone: 'Europe/Berlin',
  })
  async addFlights() {
    const urls = await this.flightService.getUrls();
    const urlFlights = await this.getFlightsFromAllApis(urls);
    for (const urlFlight of urlFlights) {
      const addedReading = await this.flightService.saveReading({
        time: new Date(),
        urlId: urlFlight.urlId,
      });
      for (const flightSuggestion of urlFlight.flightSuggestion) {
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
      this.flightService.updateUrl(urlFlight.urlId, addedReading.id);
      this.flightService.removeOldRecords();
    }
  }

  private async getFlightsFromAllApis(apiUrls: UrlLike[]) {
    const allFlights = [];
    for (const apiUrl of apiUrls) {
      const flights = await this.getFlightDataFromUrl(apiUrl.address);
      if (!flights) {
        continue;
      }
      allFlights.push({ urlId: apiUrl.id, flightSuggestion: flights });
    }
    return allFlights;
  }

  private async getFlightDataFromUrl(url: string) {
    return lastValueFrom(this.httpService.get(url))
      .then((response) => response.data.flights)
      .catch(() => {
        console.log(`error getting flights from${url}`);
      });
  }
}
