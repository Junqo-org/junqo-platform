import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserType } from '../../users/user-type.enum';

export class SignUpDTO {
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
}
