import { bcryptConstants } from './../auth/constants';
import { UserType } from './user-type.enum';
import { DomainUser } from './users';
import * as bcrypt from 'bcrypt';

describe('Users', () => {
  const password: string = 'password';
  let user: DomainUser;

  beforeAll(() => {
    user = DomainUser.create(
      '1',
      UserType.STUDENT,
      'John Doe',
      'mail@mail.com',
      bcrypt.hashSync(password, bcryptConstants.saltOrRounds),
    );
  });

  it('should create a user', () => {
    expect(user).toBeDefined();
  });

  it('should compare passwords', async () => {
    const result = await user.comparePassword(password);
    expect(result).toBeTruthy();
  });

  it('should not compare passwords', async () => {
    const result = await user.comparePassword('wrongPassword');
    expect(result).toBeFalsy();
  });

  it('should transform user to obfuscated json', () => {
    const obfuscatedUser = user.toJSON();
    expect(obfuscatedUser).toBeDefined();
    expect(obfuscatedUser).toEqual({
      id: '1',
      type: UserType.STUDENT,
      name: 'John Doe',
      email: 'mail@mail.com',
    });
  });
});
