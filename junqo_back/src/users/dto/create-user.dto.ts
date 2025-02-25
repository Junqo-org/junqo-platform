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

export class CreateUserDTO {
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

  constructor(name: string, email: string, type: UserType, password: string) {
    this.name = CreateUserDTO.checkInput(name);
    this.email = CreateUserDTO.checkInput(email);
    this.type = type;
    this.password = CreateUserDTO.checkInput(password);
  }

  /**
   * Throw an error if the input is invalid
   * @param input the input to check
   * @returns the input
   */
  private static checkInput(input: string): string {
    if (!input) {
      throw new Error(`${input} cannot be null or empty`);
    }
    if (input.indexOf(' ') >= 0) {
      throw new Error(`${input} cannot contain spaces`);
    }
    return input;
  }
}
