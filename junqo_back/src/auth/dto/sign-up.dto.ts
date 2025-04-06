import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserType } from '../../users/dto/user-type.enum';
import {
  MAX_MAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_MAIL_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '../../shared/user-validation-constants';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDTO {
  @ApiProperty({
    description: "User's full name",
    example: 'John Doe',
    minLength: MIN_NAME_LENGTH,
    maxLength: MAX_NAME_LENGTH,
    required: true,
  })
  @Expose()
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(MIN_NAME_LENGTH, {
    message: `Name must be at least ${MIN_NAME_LENGTH} characters long`,
  })
  @MaxLength(MAX_NAME_LENGTH, {
    message: `Name must be at most ${MAX_NAME_LENGTH} characters long`,
  })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    minLength: MIN_MAIL_LENGTH,
    maxLength: MAX_MAIL_LENGTH,
    required: true,
  })
  @Expose()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MinLength(MIN_MAIL_LENGTH, {
    message: `Email must be at least ${MIN_MAIL_LENGTH} characters long`,
  })
  @MaxLength(MAX_MAIL_LENGTH, {
    message: `Email must be at most ${MAX_MAIL_LENGTH} characters long`,
  })
  email: string;

  @ApiProperty({
    description: 'Type of user account',
    enum: UserType,
    example: 'STUDENT',
    required: true,
  })
  @Expose()
  @IsNotEmpty({ message: 'User type is required' })
  @IsEnum(UserType, {
    message: 'User type must be a valid UserType enum value',
  })
  type: UserType;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: MIN_PASSWORD_LENGTH,
    maxLength: MAX_PASSWORD_LENGTH,
    required: true,
  })
  @Expose()
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
  })
  @MaxLength(MAX_PASSWORD_LENGTH, {
    message: `Password must be at most ${MAX_PASSWORD_LENGTH} characters long`,
  })
  password: string;
}
