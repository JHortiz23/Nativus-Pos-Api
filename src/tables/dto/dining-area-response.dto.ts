import { ApiProperty } from '@nestjs/swagger';

export class DiningAreaResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Terraza' })
  name: string;

  @ApiProperty({ example: true })
  isActive: boolean;
}
