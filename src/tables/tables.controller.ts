import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Req } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AccessTokenPayload } from '../auth/jwt-auth.guard';
import { DiningAreasOverviewResponseDto } from './dto/dining-area-response.dto';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

type AuthenticatedRequest = Request & { user: AccessTokenPayload };

@ApiTags('tables')
@Controller('tables')
export class TablesController {
  productsService: any;
  constructor(private readonly tablesService: TablesService) { }

  // ** List all dining areas ** //
  @Get('diningareas')
  @ApiOperation({ summary: 'List dining areas with their tables and summary' })
  @ApiOkResponse({
    description: 'Dining areas overview fetched successfully',
    type: DiningAreasOverviewResponseDto,
  })
  findAllDiningAreas(@Req() request: AuthenticatedRequest) {
    return this.tablesService.findAllDiningAreas(request.user.restaurantId);
  }

  // ** Create Table ** //
  @Post()
  @ApiOperation({ summary: 'Create a table' })
  @ApiCreatedResponse({ description: 'Table created successfully' })
  create(@Req() request: AuthenticatedRequest, @Body() body: CreateTableDto) {
    return this.tablesService.create(
      body.name,
      body.seats,
      body.diningAreaId,
      request.user.restaurantId,
      body.isActive,
    );
  }

  // ** Update Table ** //
  @Put(':id')
  @ApiOperation({ summary: 'Update a table' })
  @ApiOkResponse({ description: 'Table updated successfully' })
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTableDto,
  ) {
    return this.tablesService.update(
      id,
      request.user.restaurantId,
      body.name,
      body.seats,
      body.diningAreaId,
      body.isActive,
    );
  }

}
