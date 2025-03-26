import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { PublicUserDTO } from '../../users/dto/user.dto';
import { Expose, Type } from 'class-transformer';

export class AuthPayloadDTO {
  @Expose()
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  readonly token: string;

  @Expose()
  @Type(() => PublicUserDTO)
  @IsNotEmpty({ message: 'User information is required' })
  @ValidateNested({ message: 'User information must be a valid PublicUserDTO' })
  readonly user: PublicUserDTO;
}
