import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsString, IsUUID, Min } from "class-validator";



class ShippingAddressDTO {
    @ApiProperty({ example: "1234 Market St Apt 5B" })
    streetAddress: string;

    @ApiProperty({ example: "Philadelphia" })
    city: string;

    @ApiProperty({ example: "PA" })
    state: string;

    @ApiProperty({ example: "19104" })
    postalCode: string;

    @ApiProperty({ example: "United States" })
    country: string;
}

export class GetOrderDTO{

    @ApiProperty({description:"Order Id", example:"6e3ae4f7-ff71-4ebf-8bda-a280b70142e6"})
    id:string;

    @ApiProperty({description:"Order total charged",example:150.60})
    total:number;

    @ApiProperty({description:"Order current status",example:"PAID"})
    status:string

    @ApiProperty({description:"Order shipping address", example:"John Smith 1234 Market StApt 5B Philadelphia, PA 19104",type:ShippingAddressDTO})
    shippingAddress:ShippingAddressDTO

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

export class CreateOrderItemDto{

    @IsNotEmpty({message:"Product ID is required"})
    @IsString({message:"Invalid Product ID"})
    @IsUUID()
    @ApiProperty({name:"productId",example:"6b8dd217-39b0-4c06-ae77-e69f741ba8c5"})
    productId:string;

    @IsNumber()
    @Min(1,{message:"Quantity must be greater than 1"})
    @ApiProperty({name:"quantity",example:2})
    quantity:number;
}

export class CreateOrderDto{

    @IsNotEmpty({message:"Shipping address ID is required"})
    @IsString({message:"Invalid Shipping Address ID"})
    @IsUUID()
    @ApiProperty({name:"shippingAddressId",example:"6b8dd217-39b0-4c06-ae77-e69f741ba8c5"})
    shippingAddressId:string;

    @IsNotEmpty({message:"Order items are required"})
    @IsArray()
    @ApiProperty({name:"items",type:[CreateOrderItemDto]})
    items: CreateOrderItemDto[]

}

export class CreateOrderResponseDto{

    @ApiProperty({name:"orderId",description:"ID of the new order created", example: "6b8dd217-39b0-4c06-ae77-e69f741ba8c5"})
    orderId: string;
    
    @ApiProperty({name:'paymentIntentId',description:'Stripe generated payment intent id'})
    paymentIntentId:string

    @ApiProperty({name:"clientSecret", description:"Stripe generated Token"})
    clientSecret: string;

}

export class CompleteOrderDto{
    @IsString({message:'Order ID is required'})
    @IsNotEmpty({message:'Order ID is required'})
    @IsUUID()
    orderId:string;

    @IsString({message:'Stripe payment intent id is required'})
    @IsNotEmpty({message:'Stripe payment intent id is required'})
    paymentIntentId:string;

    @IsNotEmpty({message:"Order items are required"})
    @IsArray()
    @ApiProperty({name:"items",type:[CreateOrderItemDto]})
    items: CreateOrderItemDto[]

}
