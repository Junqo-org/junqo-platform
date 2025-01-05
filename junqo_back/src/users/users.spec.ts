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

  it('should compare passwords', () => {
    expect(user.comparePassword(password)).toBe(true);
  });
});
