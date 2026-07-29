import { ApiProperty } from "@nestjs/swagger";

export class RefreshSessionDTO{

    @ApiProperty({
        description:"New JSON Web Token (JWT) used for authenticating protected routes",
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    })
    accessToken:string;

}