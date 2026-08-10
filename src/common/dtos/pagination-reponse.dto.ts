import { ApiProperty } from "@nestjs/swagger";

export class PaginatedResponseDTO<T>{
    @ApiProperty({description:'Number of the current page'})
    pageNumber:number;

    @ApiProperty({description:"Current number of requested items"})
    pageSize:number;

    @ApiProperty({description:"Number of total pages"})
    totalPages:number;

    @ApiProperty({description:"Array of items"})
    items:T[]
}