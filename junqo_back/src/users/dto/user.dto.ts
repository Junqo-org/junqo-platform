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
import { Config } from '../../shared/config';
import { OmitType, PartialType } from '@nestjs/mapped-types';

// User retrieved from database
export class UserDTO {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(MIN_NAME_LENGTH)
  @MaxLength(MAX_NAME_LENGTH)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @MinLength(MIN_MAIL_LENGTH)
  @MaxLength(MAX_MAIL_LENGTH)
  email: string;

  @IsNotEmpty()
  @IsEnum(UserType)
  type: UserType;

  @IsNotEmpty()
  @IsString()
  @IsHash(Config.HASH_ALGORITHM)
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
  @IsNotEmpty()
  @IsString()
  @MinLength(MIN_NAME_LENGTH)
  @MaxLength(MAX_NAME_LENGTH)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @MinLength(MIN_MAIL_LENGTH)
  @MaxLength(MAX_MAIL_LENGTH)
  email: string;

  @IsNotEmpty()
  @IsEnum(UserType)
  type: UserType;

  @IsNotEmpty()
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(MAX_PASSWORD_LENGTH)
  password: string;
}

// Expected values to update a User
export class UpdateUserDTO extends PartialType(CreateUserDTO) {
  @IsUUID()
  id: string;
}
