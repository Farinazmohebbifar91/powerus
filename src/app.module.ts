import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlightController } from './flight.controller';
import { FlightService } from './flight.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheService } from './cache/cache.service';
import { ScheduleModule } from '@nestjs/schedule';
import { Flight } from './entities/flight.entity';
import { FlightSlice } from './entities/flight-slice.entity';
import { FlightSuggestion } from './entities/flight-suggestion.entity';
import { URL } from './entities/url.entity';
import { Reading } from './entities/reading.entity';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'flightDB',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      Flight,
      FlightSlice,
      FlightSuggestion,
      URL,
      Reading,
    ]),
  ],
  controllers: [AppController, FlightController],
  providers: [AppService, FlightService, CacheService],
})
export class AppModule {}
