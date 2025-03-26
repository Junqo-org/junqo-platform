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
import { config } from '../../shared/config';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';

// User retrieved from database
export class UserDTO {
  @Expose()
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  id: string;

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

  @Expose()
  @IsNotEmpty({ message: 'User type is required' })
  @IsEnum(UserType, { message: 'User type must be a valid enum value' })
  type: UserType;

  @Expose()
  @IsNotEmpty({ message: 'Hashed password is required' })
  @IsString({ message: 'Hashed password must be a string' })
  @IsHash(config.HASH_ALGORITHM, {
    message: `Hashed password must be a valid ${config.HASH_ALGORITHM} hash`,
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
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(MIN_NAME_LENGTH, {
    message: `Name must be at least ${MIN_NAME_LENGTH} characters long`,
  })
  @MaxLength(MAX_NAME_LENGTH, {
    message: `Name must be at most ${MAX_NAME_LENGTH} characters long`,
  })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MinLength(MIN_MAIL_LENGTH, {
    message: `Email must be at least ${MIN_MAIL_LENGTH} characters long`,
  })
  @MaxLength(MAX_MAIL_LENGTH, {
    message: `Email must be at most ${MAX_MAIL_LENGTH} characters long`,
  })
  email: string;

  @IsNotEmpty({ message: 'User type is required' })
  @IsEnum(UserType, { message: 'User type must be a valid enum value' })
  type: UserType;

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
export class UpdateUserDTO extends PartialType(CreateUserDTO) {
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  id: string;
}
