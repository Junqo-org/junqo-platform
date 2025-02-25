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

    it('should handle null or undefined input', () => {
      expect(() => UserMapper.toDomainUser(null)).toThrow();
      expect(() => UserMapper.toDomainUser(undefined)).toThrow();
    });

    it('should handle missing optional fields', () => {
      const partialUserModel = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.STUDENT,
      };
      const result = UserMapper.toDomainUser(partialUserModel as UserModel);
      expect(result).toMatchObject(partialUserModel);
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

    it('should handle empty array', () => {
      const result = UserMapper.toDomainUsers([]);
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should handle null or undefined input', () => {
      expect(() => UserMapper.toDomainUsers(null)).toThrow();
      expect(() => UserMapper.toDomainUsers(undefined)).toThrow();
    });
  });
});
