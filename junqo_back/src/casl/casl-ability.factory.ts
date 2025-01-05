import {
  AbilityBuilder,
  CreateAbility,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { AuthUserDTO } from './../shared/dto/auth-user.dto';
import { UserType } from './../users/user-type.enum';
import { DomainUser } from './../users/users';
import { UserIdDTO } from './dto/user-id.dto';

// Describes what user can actually do in the application
export enum Action {
  MANAGE = 'manage', // `manage` is a special keyword in CASL which represents "any" action.
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

// Describes what resources user can interact with
type Subject =
  | InferSubjects<typeof DomainUser | typeof AuthUserDTO | typeof UserIdDTO>
  | 'all'; // `all` is a special keyword in CASL which represents "any" resource

export type AppAbility = MongoAbility<[Action, Subject]>;
const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: AuthUserDTO) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createAppAbility,
    );

    if (user.type === UserType.ADMIN) {
      can(Action.MANAGE, 'all'); // read-write access to everything
    } else {
      cannot(Action.MANAGE, 'all'); // no access to anything by default
    }

    can(Action.MANAGE, DomainUser, { id: user.id });
    can(Action.MANAGE, UserIdDTO, { id: user.id });
    can(Action.CREATE, DomainUser);

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subject>,
    });
  }
}
