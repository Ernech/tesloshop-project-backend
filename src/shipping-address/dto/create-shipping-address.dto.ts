import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateShippingAddressDto {
    
        @IsString({message:'Street address not valid'})
        @IsNotEmpty({message:'Street address is required'})
        @ApiProperty({name:"Street Address"})
        streetAddress:string;
    
        @IsString({message:'City not valid'})
        @IsNotEmpty({message:'City is required'})
        @ApiProperty({name:"City"})
        city:string;
    
        @IsString({message:'State not valid'})
        @IsNotEmpty({message:'State is required'})
        @ApiProperty({name:'State'})
        state:string;
    
        @IsString({message:'Postal code not valid'})
        @IsNotEmpty({message:'Postal code is required'})
        @ApiProperty({name:'Postal Code'})
        postalCode:string;
    
        @IsString({message:'Country not valid'})
        @IsNotEmpty({message:'Country is required'})
        @ApiProperty({name:'Country'})
        country:string;

}

export class ShippingAddressDto{
        
        @ApiProperty({name:"Shipping address id"})
        id:string;
    
        @ApiProperty({name:"Street Address"})
        streetAddress:string;
    
        @ApiProperty({name:"City"})
        city:string;
    
        @ApiProperty({name:'State'})
        state:string;
    
        @ApiProperty({name:'Postal Code'})
        postalCode:string;
    
        @ApiProperty({name:'Country'})
        country:string;
    
        @ApiProperty({name:'Is Defaut'})
        isDefault:boolean;
}

export class CreateShippingAddressResponseDto{
    
    @ApiProperty({name:'Message',example:"Shipping Address created"})
    message:string;

    @ApiProperty({name:'Shipping address',type:ShippingAddressDto})
    shippingAddress:ShippingAddressDto;

}