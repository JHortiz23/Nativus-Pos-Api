import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateTableDto {
    @ApiProperty({ example: 'VIP Table' })
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
            : value,
    )
    name?: string;

    @ApiProperty({ example: 3, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    diningAreaId?: number;

    @ApiProperty({ example: 4, minimum: 0 })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    seats?: number;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}