import { User as UserGraph, UserType } from 'src/graphql.schema';
import {
  AbilityBuilder,
  CreateAbility,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';

// Describes what user can actually do in the application
export enum Action {
  MANAGE = 'manage', // `manage` is a special keyword in CASL which represents "any" action.
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

// Describes what resources user can interact with
type Subject = InferSubjects<typeof UserGraph> | 'all'; // `all` is a special keyword in CASL which represents "any" resource

export type AppAbility = MongoAbility<[Action, Subject]>;
const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: UserGraph) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createAppAbility,
    );

    if (user.type === UserType.ADMIN) {
      can(Action.MANAGE, 'all'); // read-write access to everything
    } else {
      cannot(Action.MANAGE, 'all'); // no access to anything by default
    }

    can(Action.MANAGE, UserGraph, { id: user.id });
    can(Action.CREATE, UserGraph);

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subject>,
    });
  }
}
