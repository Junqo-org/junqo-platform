import { plainToInstance } from 'class-transformer';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { UserType } from '../users/dto/user-type.enum';
import { UserDTO } from '../users/dto/user.dto';
import { Actions, CaslAbilityFactory } from './casl-ability.factory';
import { UserResource } from './dto/user-resource.dto';
import { StudentProfileResource } from './dto/profile-resource.dto';
import { OfferResource } from './dto/offer-resource.dto';

describe('CaslAbilityFactory', () => {
  let caslAbilityFactory: CaslAbilityFactory;
  let studentUser: AuthUserDTO;
  let studentUser2: AuthUserDTO;
  let companyUser: AuthUserDTO;
  let schoolUser: AuthUserDTO;
  let adminUser: AuthUserDTO;

  beforeEach(() => {
    caslAbilityFactory = new CaslAbilityFactory();
    studentUser = plainToInstance(AuthUserDTO, {
      id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
      type: UserType.STUDENT,
      name: 'Student User',
      email: 'user@mail.com',
    });
    studentUser2 = plainToInstance(AuthUserDTO, {
      id: 'e69cc25b-0cc4-4032-83c2-0d34c84318bb',
      type: UserType.STUDENT,
      name: 'Student User 2',
      email: 'student.user2@mail.com',
    });
    companyUser = plainToInstance(AuthUserDTO, {
      id: 'e69cc25b-0cc4-4032-83c2-0d34c84318bc',
      type: UserType.COMPANY,
      name: 'Company User',
      email: 'company.user@mail.com',
    });
    schoolUser = plainToInstance(AuthUserDTO, {
      id: 'e69cc25b-0cc4-4032-83c2-0d34c84318bd',
      type: UserType.SCHOOL,
      name: 'School User',
      email: 'school.user@mail.com',
    });
    adminUser = plainToInstance(AuthUserDTO, {
      id: 'e69cc25b-0cc4-4032-83c2-0d34c84318be',
      type: UserType.ADMIN,
      name: 'Admin User',
      email: 'admin@mail.com',
    });
  });

  it('should be defined', () => {
    expect(new CaslAbilityFactory()).toBeDefined();
  });

  it('should createForUser', () => {
    const ability = caslAbilityFactory.createForUser(studentUser);

    expect(ability).toBeDefined();
  });

  describe('User resource casl', () => {
    it('should allow user to create STUDENT user resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const userResource: UserResource = plainToInstance(
        UserResource,
        studentUser,
      );

      expect(ability.can(Actions.CREATE, userResource)).toBeTruthy();
    });

    it('should not allow user to create ADMIN user resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const userResource: UserResource = plainToInstance(
        UserResource,
        adminUser,
      );

      expect(ability.can(Actions.CREATE, userResource)).toBeFalsy();
    });

    it('should allow user to manage user resource with same id', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const userResource: UserResource = plainToInstance(
        UserResource,
        studentUser,
      );

      expect(ability.can(Actions.MANAGE, userResource)).toBeTruthy();
    });

    it('should not allow user to manage user resource with different id', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const userResource: UserResource = plainToInstance(
        UserResource,
        studentUser2,
      );

      expect(ability.cannot(Actions.MANAGE, userResource)).toBeTruthy();
    });

    it('should not allow user to read other users resources', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const userResource: UserResource = plainToInstance(
        UserResource,
        studentUser2,
      );

      expect(ability.cannot(Actions.READ, userResource)).toBeTruthy();
    });

    it('should allow admin to manage all users resources', () => {
      const ability = caslAbilityFactory.createForUser(adminUser);

      expect(ability.can(Actions.MANAGE, 'all')).toBeTruthy();
    });
  });

  describe('Student profile resource casl', () => {
    it('should allow student user to create student profile resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);

      expect(ability.can(Actions.CREATE, StudentProfileResource)).toBeTruthy();
    });

    it('should not allow company user to create student profile resource', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);

      expect(ability.can(Actions.CREATE, StudentProfileResource)).toBeFalsy();
    });

    it('should not allow school user to create student profile resource', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);

      expect(ability.can(Actions.CREATE, StudentProfileResource)).toBeFalsy();
    });

    it('should allow student user to manage student profile resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const studentProfileResource: StudentProfileResource = plainToInstance(
        StudentProfileResource,
        { userId: studentUser.id },
      );

      expect(ability.can(Actions.MANAGE, studentProfileResource)).toBeTruthy();
    });

    it('should not allow student user to manage student profile resource with different userId', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const studentProfileResource: StudentProfileResource = plainToInstance(
        StudentProfileResource,
        { userId: studentUser2.id },
      );

      expect(ability.can(Actions.MANAGE, studentProfileResource)).toBeFalsy();
    });

    it('should not allow company user to manage student profile resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const studentProfileResource: StudentProfileResource = plainToInstance(
        StudentProfileResource,
        { userId: companyUser.id },
      );

      expect(ability.can(Actions.MANAGE, studentProfileResource)).toBeFalsy();
    });

    it('should not allow school user to manage student profile resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);
      const studentProfileResource: StudentProfileResource = plainToInstance(
        StudentProfileResource,
        { userId: schoolUser.id },
      );

      expect(ability.can(Actions.MANAGE, studentProfileResource)).toBeFalsy();
    });

    it('should allow student user to read student profile resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const studentProfileResource: StudentProfileResource = plainToInstance(
        StudentProfileResource,
        { userId: studentUser.id },
      );

      expect(ability.can(Actions.READ, studentProfileResource)).toBeTruthy();
    });

    it('should not allow student user to read student profile resource with different userId', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const studentProfileResource: StudentProfileResource = plainToInstance(
        StudentProfileResource,
        { userId: studentUser2.id },
      );

      expect(ability.can(Actions.READ, studentProfileResource)).toBeFalsy();
    });

    it('should allow company user to read student profile resource', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const studentProfileResource: StudentProfileResource = plainToInstance(
        StudentProfileResource,
        { userId: studentUser.id },
      );

      expect(ability.can(Actions.READ, studentProfileResource)).toBeTruthy();
    });

    it('should not allow school user to read student profile resource', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);
      const studentProfileResource: StudentProfileResource = plainToInstance(
        StudentProfileResource,
        { userId: studentUser.id },
      );

      expect(ability.can(Actions.READ, studentProfileResource)).toBeTruthy();
    });
  });

  describe('Offer resource casl', () => {
    it('should allow company user to create offer resource', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);

      expect(ability.can(Actions.CREATE, OfferResource)).toBeTruthy();
    });

    it('should not allow student user to create offer resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);

      expect(ability.can(Actions.CREATE, OfferResource)).toBeFalsy();
    });

    it('should not allow school user to create offer resource', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);

      expect(ability.can(Actions.CREATE, OfferResource)).toBeFalsy();
    });

    it('should allow company user to manage offer resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const offerResource: OfferResource = plainToInstance(OfferResource, {
        userId: companyUser.id,
      });

      expect(ability.can(Actions.MANAGE, offerResource)).toBeTruthy();
    });

    it('should not allow company user to manage offer resource with different userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const offerResource: OfferResource = plainToInstance(OfferResource, {
        userId: studentUser2.id,
      });

      expect(ability.can(Actions.MANAGE, offerResource)).toBeFalsy();
    });

    it('should not allow student user to manage offer resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const offerResource: OfferResource = plainToInstance(OfferResource, {
        userId: studentUser.id,
      });

      expect(ability.can(Actions.MANAGE, offerResource)).toBeFalsy();
    });

    it('should not allow school user to manage offer resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);
      const offerResource: OfferResource = plainToInstance(OfferResource, {
        userId: schoolUser.id,
      });

      expect(ability.can(Actions.MANAGE, offerResource)).toBeFalsy();
    });

    it('should allow company user to read offer resource with same userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const offerResource: OfferResource = plainToInstance(OfferResource, {
        userId: companyUser.id,
      });

      expect(ability.can(Actions.READ, offerResource)).toBeTruthy();
    });

    it('should not allow company user to read offer resource with different userId', () => {
      const ability = caslAbilityFactory.createForUser(companyUser);
      const offerResource: OfferResource = plainToInstance(OfferResource, {
        userId: studentUser2.id,
      });

      expect(ability.can(Actions.READ, offerResource)).toBeFalsy();
    });

    it('should allow student user to read offer resource', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const offerResource: OfferResource = plainToInstance(OfferResource, {
        userId: companyUser.id,
      });

      expect(ability.can(Actions.READ, offerResource)).toBeTruthy();
    });

    it('should not allow school user to read offer resource', () => {
      const ability = caslAbilityFactory.createForUser(schoolUser);
      const offerResource: OfferResource = plainToInstance(OfferResource, {
        userId: companyUser.id,
      });

      expect(ability.can(Actions.READ, offerResource)).toBeTruthy();
    });
  });
});
