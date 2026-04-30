import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AccessTokenPayload } from '../auth/jwt-auth.guard';
import { DiningAreasOverviewResponseDto } from './dto/dining-area-response.dto';
import { TablesService } from './tables.service';
import { CreateDiningAreaDto } from './dto/create-dining-area.dto';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { UpdateDiningAreaDto } from './dto/update-dining-area.dto';

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
  // ** Create Dining Area with Tables ** //
  @Post('diningarea')
  @ApiOperation({ summary: 'Create a dining area with tables' })
  @ApiCreatedResponse({ description: 'Dining area created successfully' })
  createDiningArea(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateDiningAreaDto,
  ) {
    return this.tablesService.createDiningArea(
      body.name,
      request.user.restaurantId,
      body.isActive,
      body.tables,
      body.tableName,
    );
  }

  // ** Delete Dining Area (Soft Delete) ** //
  @Delete('diningarea/:id')
  @ApiOperation({ summary: 'Delete a dining area logically' })
  @ApiOkResponse({ description: 'Dining area deleted successfully' })
  removeDiningArea(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tablesService.removeDiningArea(id, request.user.restaurantId);
  }

  // ** Update Dining Area ** //
  @Put('diningarea/:id')
  @ApiOperation({ summary: 'Update a dining area' })
  @ApiOkResponse({ description: 'Dining area updated successfully' })
  updateDiningArea(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateDiningAreaDto,
  ) {
    return this.tablesService.updateDiningArea(
      id,
      request.user.restaurantId,
      body.name,
      body.isActive,
    );
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

  // ** Delete Table (Soft Delete) ** //
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a table logically' })
  @ApiOkResponse({ description: 'Table deleted successfully' })
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tablesService.remove(id, request.user.restaurantId);
  }

}
