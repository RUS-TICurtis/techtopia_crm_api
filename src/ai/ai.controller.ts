import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { AiService } from './ai.service';

@UseGuards(JwtAuthGuard)
@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('agents')
  async getAgents(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.aiService.getAgents(tenantId);
  }

  @Get('conversations')
  async getConversations(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const userId = req.user.sub;
    return this.aiService.getConversations(userId, tenantId);
  }

  @Post('conversations')
  async createConversation(@Body('agentId') agentId: number, @Body('title') title: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const userId = req.user.sub;
    return this.aiService.createConversation(agentId, userId, title, tenantId);
  }

  @Post('conversations/:id/actions')
  async logAction(
    @Param('id') id: string,
    @Body('actionName') actionName: string,
    @Body('payload') payload: any,
    @Body('result') result: any,
    @Body('status') status: string,
    @Req() req: any
  ) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.aiService.logAction(+id, actionName, payload, result, status, tenantId);
  }

  @Get('recommendations')
  async getRecommendations(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.aiService.getRecommendations(tenantId);
  }
}
