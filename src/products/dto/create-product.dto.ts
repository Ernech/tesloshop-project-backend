import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, 
         IsPositive, IsString, MinLength 
} from 'class-validator';


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

    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0
    })
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number; 

    @ApiProperty({
        example: ['M','XL','XXL'],
        description: 'Product sizes',
    })
    @IsString({ each: true })
    @IsArray()
    sizes: string[]

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
