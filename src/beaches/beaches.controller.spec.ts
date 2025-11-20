import { Test, TestingModule } from '@nestjs/testing';
import { BeachesController } from './beaches.controller';

describe('BeachesController', () => {
  let controller: BeachesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeachesController],
    }).compile();

    controller = module.get<BeachesController>(BeachesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
