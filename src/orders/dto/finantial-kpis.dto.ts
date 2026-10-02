import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class FinancialKPIsDto {
  @ApiProperty({ description: 'Total net revenue (GMV) from paid orders', example: 15450.50 })
  @Transform(({ value }) => Number(value || 0))
  totalRevenue: number;

  @ApiProperty({ description: 'Average amount spend per order (Average) Ticket', example: 75.25 })
  @Transform(({ value }) => Number(value || 0))
  averageTicket: number;

  @ApiProperty({ description: 'Percentage of carts that successfully  transitioned to PAID', example: 42.5 })
  @Transform(({ value }) => Number(value || 0))
  conversionRate: number;

  @ApiProperty({ description: 'Total orders successfully processed (PAID)', example: 150 })
  @Transform(({ value }) => Number(value || 0))
  successfulOrdersCount: number;
}