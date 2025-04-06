import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class CompanyProfileResource {
  @Expose()
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  public userId?: string;

  constructor(userId?: string) {
    this.userId = userId;
  }
}
