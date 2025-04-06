import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { PublicUserDTO } from '../../users/dto/user.dto';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AuthPayloadDTO {
  @ApiProperty({
    description: 'JWT authentication token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  readonly token: string;

  @ApiProperty({
    description: 'User information',
    type: PublicUserDTO,
  })
  @Expose()
  @Type(() => PublicUserDTO)
  @IsNotEmpty({ message: 'User information is required' })
  @ValidateNested({ message: 'User information must be a valid PublicUserDTO' })
  readonly user: PublicUserDTO;
}

export class TokenPayloadDTO {
  @ApiProperty({
    description: 'User ID (subject)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  readonly sub: string;

  @ApiProperty({
    description: 'User\'s name',
    example: 'John Doe',
  })
  @Expose()
  readonly userName: string;

  @ApiProperty({
    description: 'User type',
    example: 'STUDENT',
  })
  @Expose()
  readonly userType: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  @Expose()
  readonly email: string;
}
