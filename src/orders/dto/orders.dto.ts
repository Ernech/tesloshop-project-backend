import { ApiProperty } from "@nestjs/swagger";

export class GetOrderDTO{

    @ApiProperty({description:"Order Id", example:"6e3ae4f7-ff71-4ebf-8bda-a280b70142e6"})
    id:string;

    @ApiProperty({description:"Order total charged",example:150.60})
    total:number;

    @ApiProperty({description:"Order current status",example:"PAID"})
    status:string

    @ApiProperty({description:"Order shipping adrres", example:"John Smith 1234 Market StApt 5B Philadelphia, PA 19104"})
    shippingAddress:string

    @ApiProperty({description:"Order creation date", example:"2026-08-07T22:18:00.000Z"})
    orderCreationDate:Date;

}