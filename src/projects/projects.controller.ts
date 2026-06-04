import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';

@UseGuards(JwtAuthGuard)
@Controller('api')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('projects')
  async getProjects(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.projectsService.findAll(tenantId);
  }

  @Get('projects/:id')
  async getProject(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.projectsService.findOne(+id, tenantId);
  }

  @Post('projects')
  async createProject(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.projectsService.create(data, tenantId, actor);
  }

  @Patch('projects/:id')
  async updateProject(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.projectsService.update(+id, data, tenantId, actor);
  }

  @Delete('projects/:id')
  async deleteProject(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    await this.projectsService.remove(+id, tenantId, actor);
    return { success: true };
  }

  // Tasks
  @Get('projects/:id/tasks')
  async getProjectTasks(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.projectsService.getTasks(+id, tenantId);
  }

  @Post('projects/:id/tasks')
  async createProjectTask(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.projectsService.createTask(+id, data, tenantId, actor);
  }

  @Patch('tasks/:taskId')
  async updateTask(@Param('taskId') taskId: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.projectsService.updateTask(+taskId, data, tenantId, actor);
  }

  @Get('tasks')
  async getAllTasks(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.projectsService.getAllTasks(tenantId);
  }

  @Post('tasks')
  async createGlobalTask(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.projectsService.createTaskGlobal(data, tenantId, actor);
  }

  @Delete('tasks/:taskId')
  async deleteTask(@Param('taskId') taskId: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    await this.projectsService.deleteTaskGlobal(+taskId, tenantId, actor);
    return { success: true };
  }

  // Milestones
  @Get('projects/:id/milestones')
  async getProjectMilestones(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.projectsService.getMilestones(+id, tenantId);
  }

  @Post('projects/:id/milestones')
  async createProjectMilestone(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.projectsService.createMilestone(+id, data, tenantId, actor);
  }

  // Comments
  @Get('tasks/:taskId/comments')
  async getTaskComments(@Param('taskId') taskId: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.projectsService.getComments(+taskId, tenantId);
  }

  @Post('tasks/:taskId/comments')
  async addTaskComment(@Param('taskId') taskId: string, @Body('content') content: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const userId = req.user.sub;
    return this.projectsService.addComment(+taskId, content, userId, tenantId);
  }
}
