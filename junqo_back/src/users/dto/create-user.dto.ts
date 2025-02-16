import { IsString, IsEmail, MinLength, IsEnum } from 'class-validator';
import { UserType } from '../user-type.enum';

export class CreateUserDTO {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(UserType)
  type: UserType;

  @IsString()
  @MinLength(6)
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
      throw new Error('Invalid input');
    }
    if (input.indexOf(' ') >= 0) {
      throw new Error('Input cannot contain spaces');
    }
    return input;
  }
}
