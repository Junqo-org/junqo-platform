import { User as UserModel } from './../models/user.model'; // Sequelize User class
import { User as UserGraphql, UserType } from './../../graphql.schema'; // GraphQL User class

export class Mapper {
  static toGraphQL(userModel: UserModel): UserGraphql {
    const userType: UserType = userModel.type as UserType;

    return {
      id: userModel.id,
      name: userModel.name,
      email: userModel.email,
      type: userType,
    };
  }

  static toGraphQl(usersModels: UserModel[]): UserGraphql[] {
    return usersModels.map((user) => this.toGraphQL(user));
  }
}
