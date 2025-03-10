import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  MAX_MAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_MAIL_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '../../shared/user-validation-constants';

export class SignInDTO {
  @IsNotEmpty()
  @IsEmail()
  @MinLength(MIN_MAIL_LENGTH)
  @MaxLength(MAX_MAIL_LENGTH)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(MAX_PASSWORD_LENGTH)
  password: string;
}
