import { ApiProperty } from "@nestjs/swagger";
import { IsDateString } from "class-validator";

export class DashboardQueryDto{

    @ApiProperty({name:'startDate',example:'2026-10-01'})
    @IsDateString({},{message:'startDate must be a valid ISO date (YYYY-MM-DD)'})
    startDate:string;
    
    @ApiProperty({name:'end',example:'2026-11-01'})
    @IsDateString({},{message:'endtDate must be a valid ISO date (YYYY-MM-DD)'})
    endDate:string;
}