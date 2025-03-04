import { IsNotEmpty, IsString } from 'class-validator';
import { PublicUserDTO } from '../../users/dto/user.dto';

export class AuthPayloadDTO {
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  @IsNotEmpty()
  readonly user: PublicUserDTO;
}
