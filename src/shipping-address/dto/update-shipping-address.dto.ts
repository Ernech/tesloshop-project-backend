import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateShippingAddressDto, ShippingAddressDto } from './create-shipping-address.dto';

export class UpdateShippingAddressDto extends PartialType(CreateShippingAddressDto) {}

export class UpdatedShippingAddressResponseDto{

    @ApiProperty({example:"Shipping address updated"})
    message:string;

    @ApiProperty({description:"Updated shipping address object",type:ShippingAddressDto})
    shippingAddress:ShippingAddressDto;

}