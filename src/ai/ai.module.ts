import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAgent, AiConversation, AiAction, AiRecommendation } from './entities/ai.entity';
import { User } from '../users/user.entity';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiAgent,
      AiConversation,
      AiAction,
      AiRecommendation,
      User,
    ]),
  ],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
