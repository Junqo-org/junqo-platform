import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { MessagesRepositoryModule } from './repository/messages.repository.module';
import { MessagesController } from './messages.controller';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [MessagesRepositoryModule, CaslModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
  exports: [MessagesService],
})
export class MessagesModule {}
