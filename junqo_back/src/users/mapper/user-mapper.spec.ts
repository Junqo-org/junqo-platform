import { UserModel } from '../repository/models/user.model';
import { UserType } from '../user-type.enum';
import { UserMapper } from './user-mapper';

describe('UserMapper', () => {
  describe('toDomainUser', () => {
    it('should correctly map UserModel to DomainUser', () => {
      const userModel = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.STUDENT,
      };
      const result = UserMapper.toDomainUser(userModel as UserModel);
      expect(result).toMatchObject(userModel);
    });
  });

  describe('toDomainUsers', () => {
    it('should correctly map array of UserModel to DomainUser array', () => {
      const userModels = [
        {
          id: '1',
          name: 'User 1',
          email: 'user1@example.com',
          type: UserType.STUDENT,
        },
        {
          id: '2',
          name: 'User 2',
          email: 'user2@example.com',
          type: UserType.ADMIN,
        },
      ];
      const result = UserMapper.toDomainUsers(userModels as UserModel[]);
      expect(result).toHaveLength(2);
      expect(result).toMatchObject(userModels);
    });
  });
});
