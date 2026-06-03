import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { CommunicationsService } from './communications.service';

@UseGuards(JwtAuthGuard)
@Controller('api/communications')
export class CommunicationsController {
  constructor(private readonly commsService: CommunicationsService) {}

  @Get('conversations')
  async getConversations(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.commsService.getConversations(tenantId);
  }

  @Get('conversations/:id/messages')
  async getMessages(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.commsService.getConversationMessages(+id, tenantId);
  }

  @Post('conversations/:id/messages')
  async sendMessage(@Param('id') id: string, @Body('content') content: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const senderId = req.user.sub;
    return this.commsService.sendMessage(+id, senderId, content, tenantId);
  }

  @Get('notifications')
  async getNotifications(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const userId = req.user.sub;
    return this.commsService.getNotifications(userId, tenantId);
  }

  @Post('notifications/:id/read')
  async markRead(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.commsService.markNotificationRead(+id, tenantId);
  }
}
