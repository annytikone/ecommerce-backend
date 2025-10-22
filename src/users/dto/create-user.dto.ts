import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Aniket Tikone' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'aniket@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ enum: ['admin', 'customer'], example: 'customer' })
  @IsOptional()
  @IsEnum(['admin', 'customer'])
  role?: 'admin' | 'customer';
}
