// The User model used in the domain layer

import { UserType } from './user-type.enum';
import * as bcrypt from 'bcrypt';

export class DomainUser {
  constructor(
    public readonly id: string,
    public readonly type: UserType,
    public readonly name: string,
    public readonly email: string,
    private readonly password: string,
  ) {}

  public static create(
    id: string,
    type: UserType,
    name: string,
    email: string,
    password: string,
  ): DomainUser {
    return new DomainUser(id, type, name, email, password);
  }

  public comparePassword(password: string): boolean {
    return bcrypt.compareSync(password, this.password);
  }
}
