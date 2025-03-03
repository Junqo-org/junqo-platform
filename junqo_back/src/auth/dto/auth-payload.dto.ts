import { Field } from '@nestjs/graphql';
import { UserDTO } from './../../users/users';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthPayloadDTO {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  @Field(() => UserDTO)
  @IsNotEmpty()
  readonly user: UserDTO;
}
