import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { FlightService } from '../flight.service';
import { HttpModule } from '@nestjs/axios';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [CacheService,
        {
          provide: FlightService,
          useValue: '',
        },],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
