import { Test, TestingModule } from '@nestjs/testing';
import { AdminStripeService } from './admin-stripe.service';

describe('AdminStripeService', () => {
  let service: AdminStripeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminStripeService],
    }).compile();

    service = module.get<AdminStripeService>(AdminStripeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
