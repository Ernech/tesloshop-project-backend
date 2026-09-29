import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, Min } from "class-validator";
import { BasePaginationDto } from "src/common/dtos/base-pagination.dto.ts";

export class ProductDTO{

    @ApiProperty({name:"id",description:"Product's id"})
    id:string;

    @ApiProperty({name:"title", description:"Product's Name"})
    title:string;

    @ApiProperty({name:"slug", description:"Product's slug"})
    slug:string;

    @ApiProperty({name:"price", description:"Product's Price"})
    price:number;

    @ApiProperty({name:"stok", description:"Product's Current Stock"})
    stock:number;

   

}

export class TopSellerProductDTO extends ProductDTO{

    @ApiProperty({name:"unitsSold", description:"Product's units sold"})
    unitsSold:number;

    @ApiProperty({name:"totalRevenue", description:"Total revenue obtained"})
    totalRevenue:number;

}

export class LowStockProductDTO extends ProductDTO{}

export class DeadStockProductDTO extends ProductDTO{}

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