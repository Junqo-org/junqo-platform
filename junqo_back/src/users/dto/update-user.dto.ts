import {
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { UserType } from '../user-type.enum';
import {
  MAX_MAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_MAIL_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '../../shared/user-validation-constants';

export class UpdateUserDTO {
  @IsString()
  id: string;

  @IsString()
  @MinLength(MIN_NAME_LENGTH)
  @MaxLength(MAX_NAME_LENGTH)
  name: string;

  @IsEmail()
  @MinLength(MIN_MAIL_LENGTH)
  @MaxLength(MAX_MAIL_LENGTH)
  email: string;

  @IsEnum(UserType)
  type: UserType;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(MAX_PASSWORD_LENGTH)
  password: string;

  constructor(
    id: string,
    name: string,
    email: string,
    type: UserType,
    password: string,
  ) {
    this.id = id;
    this.name = UpdateUserDTO.sanitizeInput(name);
    this.email = UpdateUserDTO.sanitizeInput(email);
    this.type = type;
    this.password = UpdateUserDTO.sanitizeInput(password);
  }

  private static sanitizeInput(input: string): string {
    input = input?.toLowerCase().replace(/\s/g, '');
    return input;
  }
}
