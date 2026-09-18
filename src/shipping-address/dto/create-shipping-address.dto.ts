import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateShippingAddressDto {
    
        @IsString({message:'Street address not valid'})
        @IsNotEmpty({message:'Street address is required'})
        @ApiProperty({name:"streetAddress"})
        streetAddress:string;
    
        @IsString({message:'City not valid'})
        @IsNotEmpty({message:'City is required'})
        @ApiProperty({name:"city"})
        city:string;
    
        @IsString({message:'State not valid'})
        @IsNotEmpty({message:'State is required'})
        @ApiProperty({name:'state'})
        state:string;
    
        @IsString({message:'Postal code not valid'})
        @IsNotEmpty({message:'Postal code is required'})
        @ApiProperty({name:'postalCode'})
        postalCode:string;
    
        @IsString({message:'Country not valid'})
        @IsNotEmpty({message:'Country is required'})
        @ApiProperty({name:'country'})
        country:string;

}

export class ShippingAddressDto{
        
        @ApiProperty({name:"id"})
        id:string;
    
        @ApiProperty({name:"streetAddress"})
        streetAddress:string;
    
        @ApiProperty({name:"city"})
        city:string;
    
        @ApiProperty({name:'state'})
        state:string;
    
        @ApiProperty({name:'postalCode'})
        postalCode:string;
    
        @ApiProperty({name:'country'})
        country:string;
    
        @ApiProperty({name:'isDefault'})
        isDefault:boolean;
}

export class CreateShippingAddressResponseDto{
    
    @ApiProperty({name:'message',example:"Shipping Address created"})
    message:string;

    @ApiProperty({name:'shippingAddress',type:ShippingAddressDto})
    shippingAddress:ShippingAddressDto;

}

export class GetShippingAddressesResponseDTO{
  
    @ApiProperty({name:'totalShippingAddress', example:5})
    totalShippingAddress:number

    @ApiProperty({name:'shippingAddresses',type:[ShippingAddressDto]})
    shippingAddresses:ShippingAddressDto[]

}