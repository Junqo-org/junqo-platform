import { UserType } from '../users/user-type.enum';
import { DomainUser } from '../users/users';
import { Action, CaslAbilityFactory } from './casl-ability.factory';

describe('CaslAbilityFactory', () => {
  it('should be defined', () => {
    expect(new CaslAbilityFactory()).toBeDefined();
  });

  it('should createForUser', () => {
    const caslAbilityFactory = new CaslAbilityFactory();
    const user = {
      id: '1',
      type: UserType.STUDENT,
      name: 'Test User',
      email: 'mail@mail.com',
    };
    const ability = caslAbilityFactory.createForUser(user);

    expect(ability).toBeDefined();
  });

  describe('casl authorizations', () => {
    let caslAbilityFactory: CaslAbilityFactory;
    let user: DomainUser;
    let otherUser: DomainUser;
    let admin: DomainUser;

    beforeEach(() => {
      caslAbilityFactory = new CaslAbilityFactory();
      user = new DomainUser(
        '1',
        UserType.STUDENT,
        'Test User',
        'user@mail.com',
        'password',
      );
      otherUser = new DomainUser(
        '2',
        UserType.STUDENT,
        'Other User',
        'other_user@mail.com',
        'password',
      );
      admin = new DomainUser(
        '3',
        UserType.ADMIN,
        'Admin User',
        'admin@mail.com',
        'password',
      );
    });

    it('should allow user to create user', () => {
      const ability = caslAbilityFactory.createForUser(user);

      expect(ability.can(Action.CREATE, user)).toBeTruthy();
    });

    it('should allow user to manage self', () => {
      const ability = caslAbilityFactory.createForUser(user);

      expect(ability.can(Action.MANAGE, user)).toBeTruthy();
    });

    it('should not allow user to manage other users', () => {
      const ability = caslAbilityFactory.createForUser(user);

      expect(ability.cannot(Action.MANAGE, otherUser)).toBeTruthy();
    });

    it('should not allow user to read other users', () => {
      const ability = caslAbilityFactory.createForUser(user);

      expect(ability.cannot(Action.READ, otherUser)).toBeTruthy();
    });

    it('should allow admin to manage all users', () => {
      const ability = caslAbilityFactory.createForUser(admin);

      expect(ability.can(Action.MANAGE, 'all')).toBeTruthy();
    });
  });
});
