import { Test, TestingModule } from '@nestjs/testing';
import { BeachesService } from './beaches.service';

describe('BeachesService', () => {
  let service: BeachesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BeachesService],
    }).compile();

    service = module.get<BeachesService>(BeachesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
