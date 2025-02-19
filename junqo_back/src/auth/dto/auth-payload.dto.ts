import { Field } from '@nestjs/graphql';
import { DomainUser } from './../../users/users';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthPayloadDTO {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  @Field(() => DomainUser)
  @IsNotEmpty()
  readonly user: DomainUser;
}
