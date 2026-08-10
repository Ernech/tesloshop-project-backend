import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { BasePaginationDto } from "src/common/dtos/base-pagination.dto.ts";

export class ProductPaginationDto extends BasePaginationDto{
   @ApiProperty({
    default: '',
    description: 'Filter results by gender',
  })
  @IsOptional()
  gender: 'men' | 'women' | 'unisex' | 'kid';
}