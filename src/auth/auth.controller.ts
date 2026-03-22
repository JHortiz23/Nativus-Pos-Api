import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Authenticate a user and return its organization context',
  })
  @ApiOkResponse({
    description: 'User credentials are valid and related data is returned',
  })
  @ApiUnauthorizedResponse({
    description: 'User credentials are invalid or the restaurant is inactive',
  })
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
