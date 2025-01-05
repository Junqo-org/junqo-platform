import { DomainUser } from 'src/users/users';

export class AuthPayloadDTO {
  token: string;
  user: DomainUser;
}
