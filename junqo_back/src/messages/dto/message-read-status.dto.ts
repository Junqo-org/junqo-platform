import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MessageReadStatusDTO {
  @Expose()
  id: string;

  @Expose()
  messageId: string;

  @Expose()
  userId: string;

  @Expose()
  readAt: Date;

  constructor(partial: Partial<MessageReadStatusDTO>) {
    Object.assign(this, partial);
  }
}

export class CreateMessageReadStatusDTO {
  messageId: string;
  userId: string;
}
