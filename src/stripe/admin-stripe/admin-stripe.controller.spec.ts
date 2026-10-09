import { Test, TestingModule } from '@nestjs/testing';
import { AdminStripeController } from './admin-stripe.controller';

describe('AdminStripeController', () => {
  let controller: AdminStripeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminStripeController],
    }).compile();

    controller = module.get<AdminStripeController>(AdminStripeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
