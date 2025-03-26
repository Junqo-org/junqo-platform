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
import { Expose } from 'class-transformer';

export class SignInDTO {
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
