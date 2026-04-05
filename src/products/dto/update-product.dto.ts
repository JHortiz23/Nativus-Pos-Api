import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateProductDto {
    @ApiProperty({ example: 'Rice and Beans' })
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
            : value,
    )
    name?: string;

    @ApiProperty({ example: 3500, minimum: 0 })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    price?: number;

    @ApiProperty({ example: 3, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    categoryId?: number;

    @ApiProperty({ example: 'Delicious rice with beans', nullable: true })
    @IsString()
    @IsOptional()
    description?: string | null;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}