import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsOptional, Min } from "class-validator";
import { BasePaginationDto } from "src/common/dtos/base-pagination.dto.ts";
import { ProductSize } from "../enums/product-size.enum";


export class ProductPaginationDto extends BasePaginationDto{
   @ApiPropertyOptional({
    default: '',
    description: 'Filter results by gender',
    example:'men'
  })
  @IsOptional()
  gender?: 'men' | 'women' | 'unisex' | 'kid';

   @ApiPropertyOptional({
    description: 'Filter results by a minimum price',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number) // Convierte el query param string a number
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Filter results by a maximum price',
    example: 150,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number) // Convierte el query param string a number
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    default:[],
    description:'Filter results by selected sizes (comma-separated or array)',
    example:['S','M']
  })
  @IsOptional()
  @Transform(({value})=>{
    if(!value) return undefined;
    if (Array.isArray(value)) {
      return value.map((v) => String(v).trim().toUpperCase());
    }
    return String(value)
      .split(',')
      .map((v) => v.trim().toUpperCase())
      .filter(Boolean);
  })
  @IsArray()
  @IsEnum(ProductSize,{each:true})
  sizes?:ProductSize[]

  @ApiPropertyOptional({
    default:[],
    description:'Filter results by selected sizes (comma-separated or array)',
    example:['hoodies','shirt']
  })
  @IsOptional()
  @Transform(({value})=>{
    if(!value) return undefined;
    if(Array.isArray(value)){
        return value.map((v) => String(v).trim().toUpperCase());
    }
    return String(value)
      .split(',')
      .map((v) => v.trim().toUpperCase())
      .filter(Boolean);
  })
  categories?:string[]
}