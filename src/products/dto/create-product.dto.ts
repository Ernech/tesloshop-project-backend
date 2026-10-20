import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, 
         IsPositive, IsString, MinLength, 
         ValidateNested
} from 'class-validator';
import { ProductSize } from '../enums/product-size.enum';
import { Type } from 'class-transformer';

export class ProductSizeDto{

    @ApiProperty({name:'stock',example:5})
    @IsInt()
    @IsPositive()
    stock: number; 

    @ApiProperty({
        enum:ProductSize,
        description: 'Product sizes',
    })
    @IsEnum(ProductSize,{message: `Size must be one of the following values: ${Object.values(ProductSize).join(', ')}`})
    size:ProductSize 
}

export class CreateProductDto {

    @ApiProperty({
        description: 'Product title (unique)',
         example: 'T-Shirt Teslo',
        nullable: false,
        minLength: 1
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty({
        example: 20.0,
        description: 'Product price',
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty({
        example: 'Elevate your everyday style with the Teslo Essential T-Shirt. Crafted from 100% premium Peruvian cotton, this tee offers unmatched breathability, a tailored fit, and durable stitching that holds up wash after wash. Perfect for casual wear or layering.',
        description: 'Product description',
        default: null,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product SLUG - for SEO',
        uniqueItems: true
    })
    @IsString()
    @IsOptional()
    slug?: string;

  
 
    @ApiProperty({type:[ProductSizeDto], description: 'List of sizes with their corresponding stock levels'})
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductSizeDto)
    @IsNotEmpty({ message: 'At least one product stock must be provided' }) 
    productSizes:ProductSizeDto[]

    @ApiProperty({
        example: 'women',
        description: 'Product gender',
    })
    @IsIn(['men','women','kid','unisex'])
    gender: string;

    @ApiProperty({
        description: 'Search keywords and filter labels used to group products and improve searchability across the store',
        example: ['shirt', 'apparel', 'classic', 'tesla'],
        required: false
    })
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags: string[];

    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[];


}

