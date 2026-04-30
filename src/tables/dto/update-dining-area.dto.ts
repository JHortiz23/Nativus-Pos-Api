import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateDiningAreaDto {
    @ApiProperty({ example: 'VIP Table' })
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
            : value,
    )
    name?: string;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}