import { DomainUser } from './../../users/users';

export class AuthPayloadDTO {
  token: string;
  user: DomainUser;
}
