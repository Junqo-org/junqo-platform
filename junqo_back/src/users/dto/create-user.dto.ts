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
    this.name = CreateUserDTO.sanitizeInput(name);
    this.email = CreateUserDTO.sanitizeInput(email);
    this.type = type;
    this.password = CreateUserDTO.sanitizeInput(password);
  }

  private static sanitizeInput(input: string): string {
    input = input?.toLowerCase().replace(/\s/g, '');
    return input;
  }
}
