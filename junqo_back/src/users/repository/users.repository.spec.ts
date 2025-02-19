import { UsersRepository } from './users.repository';
import { UserModel } from './models/user.model';

describe('UsersRepository', () => {
  it('should be defined', () => {
    expect(new UsersRepository(UserModel)).toBeDefined();
  });
});
