import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";


export class TopCustomersDto{

  @ApiProperty({name:'id',example:'aa64da7e-02cb-409c-9ec7-9556ed9cc79b'})  
  id: string;
  
  @ApiProperty({name:'fullName',example:'John Doe'})
  fullName: string;
  
  @ApiProperty({name:'email',example:'johndoe@mail.com'})
  email: string;
  
  @ApiProperty({name:'totalSpent',example: 1500.00})
  @Transform(({ value }) => Number(value || 0))
  totalSpent: number;
  
  @ApiProperty({name:'ordersCount',example: 20})
  @Transform(({ value }) => Number(value || 0))
  ordersCount: number;


}