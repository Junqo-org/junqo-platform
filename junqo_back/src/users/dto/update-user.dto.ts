import { IsString, IsEmail, MinLength, IsEnum } from 'class-validator';
import { UserType } from '../user-type.enum';

export class UpdateUserDTO {
  @IsString()
  id: string;

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
