import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsOptional, Min } from "class-validator";
import { BasePaginationDto } from "src/common/dtos/base-pagination.dto.ts";
import { ProductSize } from "../enums/product-size.enum";

export class ProductDTO{

    @ApiProperty({name:"id",description:"Product's id"})
    id:string;

    @ApiProperty({name:"title", description:"Product's Name"})
    title:string;

    @ApiProperty({name:"slug", description:"Product's slug"})
    slug:string;

    @ApiProperty({name:"price", description:"Product's Price"})
    price:number;


   

}

export class TopSellerProductDTO extends ProductDTO {
    @ApiProperty({ name: "size", enum: ProductSize, description: "The specific best-selling size" })
    size: ProductSize;

    @ApiProperty({ name: "unitsSold", description: "Units sold for this specific size" })
    @Transform(({ value }) => Number(value)) 
    unitsSold: number;

    @ApiProperty({ name: "totalRevenue", description: "Total revenue obtained by this size" })
    @Transform(({ value }) => Number(value))
    totalRevenue: number;
}


export class LowStockProductDTO extends ProductDTO{

    @ApiProperty({ name: "size", enum: ProductSize, description: "The specific low stock size" })
    size: ProductSize;

    @ApiProperty({ name: "stock", description: "Current stock for this specific size" })
    stock: number;

}

export class DeadStockProductDTO extends ProductDTO{
    
     @ApiProperty({ name: "size", enum: ProductSize, description: "The specific dead stock size" })
    size: ProductSize;

    @ApiProperty({ name: "stock", description: "Current stagnant stock for this specific size" })
    stock: number;
}

export class GetTopSellersResponseDTO{

    @ApiProperty({name:"message", example:"Top 10 best-selling products"})
    message:string;

    @ApiProperty({name:"date"})
    date:Date;

    @ApiProperty({name:"products",type:[TopSellerProductDTO]})
    products:TopSellerProductDTO[]

}

export class LowStockPaginationDTO extends BasePaginationDto{
    
    @ApiProperty({
        name:'threshold',
        description:'Low Stock Products threshold',
        default:10,
        required:false
    })
    @Type(()=>Number)
    @IsOptional()
    @Min(0)
    threshold?:number;
}

export class DeadStockProductResponseDTO{

    @ApiProperty({
        name:"message",
        example:"Getting the dead stock from the last 30 days"
    })
    message:string;

    @ApiProperty({
        name:"products",
        type:[DeadStockProductDTO]
    })
    products:DeadStockProductDTO[]

}