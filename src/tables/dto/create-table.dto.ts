import { Type, Transform } from 'class-transformer';
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTableDto {
    @ApiProperty({ example: 'VIP Table' })
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
            : value,
    )
    name: string;

    @ApiProperty({ example: 5, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    seats: number;

    @ApiProperty({ example: 2, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    diningAreaId: number;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
