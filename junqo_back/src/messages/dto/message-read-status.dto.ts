import { Exclude, Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({ description: 'Message ID to mark as read' })
  @IsUUID()
  messageId: string;

  @ApiProperty({ description: 'User ID marking the message as read' })
  @IsUUID()
  userId: string;
}
