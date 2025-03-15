import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class OfferResource {
  @Expose()
  @IsUUID()
  public userId?: string;

  constructor(userId?: string) {
    this.userId = userId;
  }
}
