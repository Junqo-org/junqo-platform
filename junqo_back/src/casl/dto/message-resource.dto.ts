import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class MessageResource {
  @Expose()
  @IsUUID('4', { message: 'Sender ID must be a valid UUID' })
  public senderId?: string;

  constructor(senderId?: string) {
    this.senderId = senderId;
  }
}
