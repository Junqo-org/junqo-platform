import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { PublicUserDTO } from '../../users/dto/user.dto';
import { Expose, Type } from 'class-transformer';

export class AuthPayloadDTO {
  @Expose()
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  @Expose()
  @Type(() => PublicUserDTO)
  @IsNotEmpty()
  @ValidateNested()
  readonly user: PublicUserDTO;
}
