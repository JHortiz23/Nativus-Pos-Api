import { ApiProperty } from '@nestjs/swagger';

export enum TableStatusDto {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
}

export class TableSummaryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Table 1' })
  name: string;

  @ApiProperty({ enum: TableStatusDto, example: TableStatusDto.AVAILABLE })
  status: TableStatusDto;

  @ApiProperty({ example: 4, nullable: true })
  seats: number | null;

  @ApiProperty({ example: 8 })
  diningAreaId: number;

  @ApiProperty({ example: false })
  isActive: boolean;

  @ApiProperty({ example: false })
  isDeleted: boolean;
}

export class DiningAreaResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Main Dining Room' })
  name: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 5 })
  tablesCount: number;

  @ApiProperty({ example: 4 })
  availableCount: number;

  @ApiProperty({ example: 1 })
  occupiedCount: number;

  @ApiProperty({ type: TableSummaryResponseDto, isArray: true })
  tables: TableSummaryResponseDto[];
}

export class TablesSummaryResponseDto {
  @ApiProperty({ example: 11 })
  totalTables: number;

  @ApiProperty({ example: 8 })
  availableTables: number;

  @ApiProperty({ example: 3 })
  occupiedTables: number;
}

export class DiningAreasOverviewResponseDto {
  @ApiProperty({ type: TablesSummaryResponseDto })
  summary: TablesSummaryResponseDto;

  @ApiProperty({ type: DiningAreaResponseDto, isArray: true })
  diningAreas: DiningAreaResponseDto[];
}
