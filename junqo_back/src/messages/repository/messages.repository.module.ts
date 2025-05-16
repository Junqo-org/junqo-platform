import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MessageModel } from './models/message.model';
import { MessageReadStatusModel } from './models/message-read-status.model';
import { MessagesRepository } from './messages.repository';

@Module({
  imports: [SequelizeModule.forFeature([MessageModel, MessageReadStatusModel])],
  providers: [MessagesRepository],
  exports: [MessagesRepository],
})
export class MessagesRepositoryModule {}
