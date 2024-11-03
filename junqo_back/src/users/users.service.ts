import { Injectable } from '@nestjs/common';
import { User } from '../graphql';

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'mail',
    },
    {
      id: '2',
      name: 'Jane Doe',
      email: 'mail',
    },
  ];

  getUsers(): User[] {
    return this.users;
  }

  getUser(id: string): User {
    return this.users.find((user) => user.id === id);
  }

  createUser(name: string, email: string): User {
    const user: User = {
      id: String(this.users.length + 1),
      name,
      email,
    };
    this.users.push(user);
    return user;
  }

  updateUser(id: string, name: string, email: string): User {
    const userIndex = this.users.findIndex((user) => user.id === id);
    this.users[userIndex] = {
      ...this.users[userIndex],
      name,
      email,
    };
    return this.users[userIndex];
  }

  deleteUser(id: string): User {
    const userIndex = this.users.findIndex((user) => user.id === id);
    const user = this.users[userIndex];
    this.users.splice(userIndex, 1);
    return user;
  }
}
