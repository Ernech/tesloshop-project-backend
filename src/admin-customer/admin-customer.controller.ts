import { Controller } from '@nestjs/common';
import { AdminCustomerService } from './admin-customer.service';

@Controller('admin/customer')
export class AdminCustomerController {
  constructor(private readonly adminCustomerService: AdminCustomerService) {}
}
