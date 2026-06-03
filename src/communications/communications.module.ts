import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation, Message, Notification } from './entities/communication.entity';
import { User } from '../users/user.entity';
import { CommunicationsService } from './communications.service';
import { CommunicationsController } from './communications.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      Message,
      Notification,
      User,
    ]),
  ],
  providers: [CommunicationsService],
  controllers: [CommunicationsController],
  exports: [CommunicationsService],
})
export class CommunicationsModule {}
