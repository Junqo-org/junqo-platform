import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class StudentProfileResource {
  @Expose()
  @IsUUID()
  public userId?: string;

  constructor(userId: string) {
    this.userId = userId;
  }
}
