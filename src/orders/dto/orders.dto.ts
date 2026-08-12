import { ApiProperty } from "@nestjs/swagger";
import { Column } from "typeorm";

export class GetOrderDTO{

    @ApiProperty({description:"Order Id", example:"6e3ae4f7-ff71-4ebf-8bda-a280b70142e6"})
    id:string;

    @ApiProperty({description:"Order total charged",example:150.60})
    total:number;

    @ApiProperty({description:"Order current status",example:"PAID"})
    status:string

    @ApiProperty({description:"Order shipping address", example:"John Smith 1234 Market StApt 5B Philadelphia, PA 19104"})
    shippingAddress:string

    @ApiProperty({description:"Order creation date", example:"2026-08-07T22:18:00.000Z"})
    orderCreationDate:Date;

}

export class OrderItemDto{

    @ApiProperty({description:"Order Item Id", example:"6e3ae4f7-ff71-4ebf-8bda-a280b70142e6"})
    id:string;

    @ApiProperty({description:"Product's name", example:"Men's Quilted Shirt Jacket"})
    productName:string;

    @ApiProperty({description:'Quantity purchased',example:2})
    quantity:number;

    @ApiProperty({description:"Product price",example:50.20})
    price:number;

}

export class GetOrderDetailDto extends GetOrderDTO{

    @ApiProperty({ type: [OrderItemDto] })
    orderItems:OrderItemDto[]
}

