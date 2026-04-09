import { Controller, Get, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AccessTokenPayload } from '../auth/jwt-auth.guard';
import { DiningAreaResponseDto } from './dto/dining-area-response.dto';
import { TablesService } from './tables.service';

type AuthenticatedRequest = Request & { user: AccessTokenPayload };

@ApiTags('tables')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get('diningareas')
  @ApiOperation({ summary: 'List dining areas' })
  @ApiOkResponse({
    description: 'Dining areas fetched successfully',
    type: DiningAreaResponseDto,
    isArray: true,
  })
  findAllDiningAreas(@Req() request: AuthenticatedRequest) {
    return this.tablesService.findAllDiningAreas(request.user.restaurantId);
  }
}
