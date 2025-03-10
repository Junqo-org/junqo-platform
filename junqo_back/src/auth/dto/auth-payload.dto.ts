import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { PublicUserDTO } from '../../users/dto/user.dto';
import { Type } from 'class-transformer';

export class AuthPayloadDTO {
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  @Type(() => PublicUserDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly user: PublicUserDTO;
}
