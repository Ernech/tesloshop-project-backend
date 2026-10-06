import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";


export class CustomerRetentionDto{

  @ApiProperty({name:'oneTimeBuyers', example:25})
  @Transform(({ value }) => Number(value || 0))
  oneTimeBuyers: number; 
  
  @ApiProperty({name:'recurringBuyers', example:30})
  @Transform(({ value }) => Number(value || 0))
  recurringBuyers: number; 
  
  @ApiProperty({name:'recurrenceRate', example:65.0})
  @Transform(({ value }) => Number(value || 0))
  recurrenceRate: number; 


}