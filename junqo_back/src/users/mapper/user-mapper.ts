import { UserModel } from '../repository/models/user.model';
import { UserType } from '../user-type.enum';
import { DomainUser } from '../users';

export class UserMapper {
  public static toDomainUser(userModel: UserModel): DomainUser {
    return DomainUser.create(
      userModel.id,
      userModel.type as UserType,
      userModel.name,
      userModel.email,
      userModel.password,
    );
  }

  public static toDomainUsers(userModels: UserModel[]): DomainUser[] {
    return userModels.map((userModel) => UserMapper.toDomainUser(userModel));
  }
}
