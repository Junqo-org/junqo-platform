import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MessageModel } from './models/message.model';
import { MessageReadStatusModel } from './models/message-read-status.model';
import { MessagesRepository } from './messages.repository';
import { ConversationsRepositoryModule } from '../../conversations/repository/conversations.repository.module';

@Module({
  imports: [
    SequelizeModule.forFeature([MessageModel, MessageReadStatusModel]),
    ConversationsRepositoryModule,
  ],
  providers: [MessagesRepository],
  exports: [MessagesRepository],
})
export class MessagesRepositoryModule {}
