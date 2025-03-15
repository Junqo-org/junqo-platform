import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { UserType } from '../../users/dto/user-type.enum';
import { Expose } from 'class-transformer';

export class UserResource {
  @Expose()
  @IsUUID()
  public id?: string;

  @Expose()
  @IsNotEmpty()
  @IsEnum(UserType)
  public type?: UserType;

  constructor(data: UserResource) {
    Object.assign(this, data);
  }
}
