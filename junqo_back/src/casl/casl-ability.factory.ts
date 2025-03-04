import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { AuthUserDTO } from './../shared/dto/auth-user.dto';
import { UserType } from '../users/dto/user-type.enum';
import { UserIdDTO } from './dto/user-id.dto';
import { StudentProfileIdDTO } from './dto/profile-id.dto';
import { UserDTO } from '../users/dto/user.dto';

// Describes what user can actually do in the application
export enum Actions {
  MANAGE = 'manage', // `manage` is a special keyword in CASL which represents "any" action.
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

// Describes what resources user can interact with
type Subjects =
  | InferSubjects<
      | typeof UserDTO
      | typeof AuthUserDTO
      | typeof UserIdDTO
      | typeof StudentProfileIdDTO
    >
  | 'all'; // `all` is a special keyword in CASL which represents "any" resource

export type AppAbility = MongoAbility<[Actions, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: AuthUserDTO) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    if (user.type === UserType.ADMIN) {
      can(Actions.MANAGE, 'all'); // read-write access to everything
    } else {
      cannot(Actions.MANAGE, 'all'); // no access to anything by default
    }

    can(Actions.MANAGE, UserDTO, { id: user.id });
    can(Actions.MANAGE, AuthUserDTO, { id: user.id });
    can(Actions.MANAGE, UserIdDTO, { id: user.id });
    can(Actions.CREATE, UserDTO, { type: { $ne: UserType.ADMIN } });
    can(Actions.CREATE, AuthUserDTO, { type: { $ne: UserType.ADMIN } });
    cannot(Actions.CREATE, UserIdDTO);

    can(Actions.MANAGE, StudentProfileIdDTO, { id: user.id });
    can(Actions.READ, StudentProfileIdDTO, 'all');

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
