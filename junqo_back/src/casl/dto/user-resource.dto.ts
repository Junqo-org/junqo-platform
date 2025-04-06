import { IsEnum, IsUUID } from 'class-validator';
import { UserType } from '../../users/dto/user-type.enum';
import { Expose } from 'class-transformer';

export class UserResource {
  @Expose()
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  public id?: string;

  @Expose()
  @IsEnum(UserType, {
    message: 'User type must be a valid UserType enum value',
  })
  public type?: UserType;

  constructor(data: UserResource) {
    Object.assign(this, data);
  }
}
