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
import { UserResource } from './dto/user-resource.dto';
import { StudentProfileResource } from './dto/student-profile-resource.dto';
import { UserDTO } from '../users/dto/user.dto';
import { OfferResource } from './dto/offer-resource.dto';
import { SchoolProfileResource } from './dto/school-profile-resource.dto';
import { CompanyProfileResource } from './dto/company-profile-resource.dto';
import { ApplicationResource } from './dto/application-resource.dto';
import { ConversationResource } from './dto/conversation-resource.dto';
import { MessageResource } from './dto/message-resource.dto';

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
      | typeof UserResource
      | typeof StudentProfileResource
      | typeof CompanyProfileResource
      | typeof SchoolProfileResource
      | typeof OfferResource
      | typeof ApplicationResource
      | typeof ConversationResource
      | typeof MessageResource
    >
  | 'all'; // `all` is a special keyword in CASL which represents "any" resource

export type AppAbility = MongoAbility<[Actions, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: AuthUserDTO) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    if (user.type !== UserType.ADMIN) {
      cannot(Actions.MANAGE, 'all'); // no access to anything by default
    }

    cannot(Actions.READ, UserResource, { id: { $exists: false } });
    can(Actions.MANAGE, UserResource, { id: user.id });
    cannot(Actions.CREATE, UserResource, { type: { $exists: false } });
    can(Actions.CREATE, UserResource, { type: { $ne: UserType.ADMIN } });
    can(Actions.MANAGE, ConversationResource, {
      participantsIds: { $elemMatch: { $eq: user.id } },
    });
    can([Actions.CREATE], MessageResource, {
      senderId: user.id,
      conversationParticipantsIds: { $elemMatch: { $eq: user.id } },
    });
    can([Actions.READ], MessageResource, {
      conversationParticipantsIds: { $elemMatch: { $eq: user.id } },
    });
    can([Actions.READ, Actions.UPDATE, Actions.DELETE], MessageResource, {
      senderId: user.id,
    });

    if (user.type === UserType.STUDENT) {
      can(Actions.CREATE, StudentProfileResource, { userId: user.id });
      can(Actions.MANAGE, StudentProfileResource, { userId: user.id });
      can(Actions.READ, OfferResource);
      can(Actions.READ, SchoolProfileResource);
      can(Actions.READ, CompanyProfileResource);
      can(Actions.CREATE, ApplicationResource, { studentId: user.id });
      can([Actions.READ, Actions.DELETE], ApplicationResource, {
        studentId: user.id,
      });
    }
    if (user.type === UserType.COMPANY) {
      can(Actions.CREATE, CompanyProfileResource, { userId: user.id });
      can(Actions.MANAGE, CompanyProfileResource, { userId: user.id });
      can(Actions.CREATE, OfferResource, { userId: user.id });
      can(Actions.MANAGE, OfferResource, { userId: user.id });
      can(Actions.READ, StudentProfileResource);
      can(Actions.READ, SchoolProfileResource);
      can([Actions.READ, Actions.UPDATE, Actions.DELETE], ApplicationResource, {
        companyId: user.id,
      });
    }
    if (user.type === UserType.SCHOOL) {
      can(Actions.CREATE, SchoolProfileResource, { userId: user.id });
      can(Actions.MANAGE, SchoolProfileResource, { userId: user.id });
      can(Actions.READ, OfferResource);
      can(Actions.READ, StudentProfileResource);
      can(Actions.READ, CompanyProfileResource);
      can(Actions.READ, ApplicationResource, {
        studentLinkedSchoolId: user.id,
      });
    }

    if (user.type === UserType.ADMIN) {
      can(Actions.MANAGE, 'all'); // read-write access to everything
    }

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
