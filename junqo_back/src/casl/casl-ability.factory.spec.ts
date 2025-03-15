import { plainToInstance } from 'class-transformer';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { UserType } from '../users/dto/user-type.enum';
import { UserDTO } from '../users/dto/user.dto';
import { Actions, CaslAbilityFactory } from './casl-ability.factory';
import { UserResource } from './dto/user-resource.dto';

describe('CaslAbilityFactory', () => {
  describe('casl authorizations', () => {
    let caslAbilityFactory: CaslAbilityFactory;
    let studentUser: UserDTO;
    let studentUser2: AuthUserDTO;
    let adminUser: UserDTO;

    beforeEach(() => {
      caslAbilityFactory = new CaslAbilityFactory();
      studentUser = plainToInstance(UserDTO, {
        id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
        type: UserType.STUDENT,
        name: 'Test User',
        email: 'user@mail.com',
        hashedPassword:
          '9f40fc5e51daeef6ef4e4343b8946536c5a267b30c1ea4d314f67e9f2b6d9704',
      });
      studentUser2 = plainToInstance(AuthUserDTO, {
        id: 'e69cc25b-0cc4-4032-83c2-0d34c84318bb',
        type: UserType.STUDENT,
        name: 'Other User',
        email: 'other.user@mail.com',
      });
      adminUser = plainToInstance(UserDTO, {
        id: 'e69cc25b-0cc4-4032-83c2-0d34c84318bc',
        type: UserType.ADMIN,
        name: 'Admin User',
        email: 'admin@mail.com',
        hashedPassword:
          '9f40fc5e51daeef6ef4e4343b8946536c5a267b30c1ea4d314f67e9f2b6d9704',
      });
    });

    it('should be defined', () => {
      expect(new CaslAbilityFactory()).toBeDefined();
    });

    it('should createForUser', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);

      expect(ability).toBeDefined();
    });

    it('should allow user to create STUDENT user', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const userResource: UserResource = plainToInstance(
        UserResource,
        studentUser,
      );

      expect(ability.can(Actions.CREATE, userResource)).toBeTruthy();
    });

    it('should not allow user to create ADMIN user', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const userResource: UserResource = plainToInstance(
        UserResource,
        adminUser,
      );

      expect(ability.can(Actions.CREATE, userResource)).toBeFalsy();
    });

    it('should allow user to manage self', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const userResource: UserResource = plainToInstance(
        UserResource,
        studentUser,
      );

      expect(ability.can(Actions.MANAGE, userResource)).toBeTruthy();
    });

    it('should not allow user to manage other users', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const userResource: UserResource = plainToInstance(
        UserResource,
        studentUser2,
      );

      expect(ability.cannot(Actions.MANAGE, userResource)).toBeTruthy();
    });

    it('should not allow user to read other users', () => {
      const ability = caslAbilityFactory.createForUser(studentUser);
      const userResource: UserResource = plainToInstance(
        UserResource,
        studentUser2,
      );

      expect(ability.cannot(Actions.READ, userResource)).toBeTruthy();
    });

    it('should allow admin to manage all users', () => {
      const ability = caslAbilityFactory.createForUser(adminUser);

      expect(ability.can(Actions.MANAGE, 'all')).toBeTruthy();
    });
  });
});
