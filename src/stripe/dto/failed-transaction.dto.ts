import { ApiProperty } from '@nestjs/swagger';

export class FailedTransactionDto {
  @ApiProperty({ description: 'Unique transaction ID from the DB' })
  id: string;

  @ApiProperty({ description: 'Stripe Payment Intent ID' })
  stripePaymentIntentId: string;

  @ApiProperty({ description: 'Stripe transaction Status', example: 'payment_failed' })
  status: string;

  @ApiProperty({ description: 'The reason why stripe declined the payment', example: 'card_declined' })
  failureReason: string;

  @ApiProperty({ description: 'Payment intent date' })
  createdAt: Date;

  @ApiProperty({ description: 'Details of the customer who attempted to make a purchase' })
  customer: {
    id: string;
    fullName: string;
    email: string;
  };

  @ApiProperty({ description: 'Total amount attempted to be charged' })
  orderTotal: number;

  @ApiProperty({ description: 'Associated Order ID' })
  orderId: string;
}
