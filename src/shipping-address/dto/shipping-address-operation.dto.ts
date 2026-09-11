import { ApiProperty } from "@nestjs/swagger";

export class ShippingAddressOperationDto{

    @ApiProperty({example:"Shipping address Operation message"})
    message:string;


}