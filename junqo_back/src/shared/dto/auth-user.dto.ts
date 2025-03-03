import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserType } from '../../users/dto/user-type.enum';
import {
  MAX_MAIL_LENGTH,
  MAX_NAME_LENGTH,
  MIN_MAIL_LENGTH,
  MIN_NAME_LENGTH,
} from '../user-validation-constants';

export class AuthUserDTO {
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

  constructor(data: Partial<AuthUserDTO>) {
    Object.assign(this, data);
  }
}
