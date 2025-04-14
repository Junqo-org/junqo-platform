import {
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
  MaxLength,
  IsUUID,
  IsNotEmpty,
  IsHash,
} from 'class-validator';
import { UserType } from './user-type.enum';
import {
  MAX_MAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_MAIL_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '../../shared/user-validation-constants';
import { JWT_CONSTANTS } from '../../config/config.service';
import { ApiProperty } from '@nestjs/swagger';
import { OmitType, PartialType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

// User retrieved from database
export class UserDTO {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  id: string;

  @ApiProperty({
    description: "User's full name",
    example: 'John Doe',
    minLength: MIN_NAME_LENGTH,
    maxLength: MAX_NAME_LENGTH,
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
  })
  @Expose()
  @IsNotEmpty({ message: 'User type is required' })
  @IsEnum(UserType, { message: 'User type must be a valid enum value' })
  type: UserType;

  @ApiProperty({
    description: 'Hashed password',
    example: '5f4dcc3b5aa765d61d8327deb882cf99',
  })
  @Expose()
  @IsNotEmpty({ message: 'Hashed password is required' })
  @IsString({ message: 'Hashed password must be a string' })
  @IsHash(JWT_CONSTANTS.algorithm, {
    message: `Hashed password must be a valid ${JWT_CONSTANTS.algorithm} hash`,
  })
  hashedPassword: string;

  // Obligatory for use with casl ability
  constructor(data: Partial<UserDTO>) {
    Object.assign(this, data);
  }
}

// User without sensitive data
export class PublicUserDTO extends OmitType(UserDTO, ['hashedPassword']) {}

// Expected values to create a User
export class CreateUserDTO {
  @ApiProperty({
    description: "User's full name",
    example: 'John Doe',
    minLength: MIN_NAME_LENGTH,
    maxLength: MAX_NAME_LENGTH,
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
  })
  @Expose()
  @IsNotEmpty({ message: 'User type is required' })
  @IsEnum(UserType, { message: 'User type must be a valid enum value' })
  type: UserType;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: MIN_PASSWORD_LENGTH,
    maxLength: MAX_PASSWORD_LENGTH,
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

// Expected values to update a User
export class UpdateUserDTO extends PartialType(CreateUserDTO) {}
