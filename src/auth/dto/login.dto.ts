import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'cashier@nativus.com',
    description: 'User email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '1234',
    description: 'User PIN or password for POS authentication',
  })
  @IsString()
  @IsNotEmpty()
  pin: string;

  @ApiPropertyOptional({
    example: '12h',
    description: 'Optional access token TTL, defaults to 12h',
  })
  @IsOptional()
  @IsString()
  expiresIn?: string;
}
