import { Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserDTO } from '../../users/dto/user.dto';

export class AuthPayloadDTO {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  @Field(() => UserDTO)
  @IsNotEmpty()
  readonly user: UserDTO;
}
