import { Test, TestingModule } from '@nestjs/testing';
import { AdminCustomerService } from './admin-customer.service';

describe('AdminCustomerService', () => {
  let service: AdminCustomerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminCustomerService],
    }).compile();

    service = module.get<AdminCustomerService>(AdminCustomerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
