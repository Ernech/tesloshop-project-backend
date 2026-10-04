import { IsEnum, IsOptional } from "class-validator";
import { DateIntervals } from "../enums/date-intervals.enum";
import { ApiProperty } from "@nestjs/swagger";
import { DashboardQueryDto } from "./dashboard-query.dt";

export class SalesTrendQueryParamsDto extends DashboardQueryDto{

    @ApiProperty({name:'interval',example:'day'})
    @IsEnum(DateIntervals,{message:'inverval must be either "day" or "month"'})
    @IsOptional()
    interval?:DateIntervals = DateIntervals.DAY

}

export class SaleDto{

    @ApiProperty({name:'perdiod',example:'2025-10-04 00:00:00'})
    period:string;

    @ApiProperty({name:'revenue',example:'15000.00'})
    revenue:number;

    @ApiProperty({name:'ordersCount',example:'50'})
    ordersCount:number;

}

export class SalesTrendsResponseDto{

    @ApiProperty({name:'message',example:'Sales trend since 2025-10-01 00:00:00 until 2025-11-01 00:00:00'})
    message:string

    @ApiProperty({name:'items',type:[SaleDto]})
    items:SaleDto[]

}