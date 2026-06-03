import { Controller, Get, Post, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { HrService } from './hr.service';

@UseGuards(JwtAuthGuard)
@Controller('api/hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // Departments
  @Get('departments')
  async getDepartments(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.hrService.getDepartments(tenantId);
  }

  @Post('departments')
  async createDepartment(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.hrService.createDepartment(data, tenantId, actor);
  }

  // Employees
  @Get('employees')
  async getEmployees(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.hrService.getEmployees(tenantId);
  }

  @Get('employees/:id')
  async getEmployee(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.hrService.getEmployee(+id, tenantId);
  }

  @Post('employees')
  async createEmployee(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.hrService.createEmployee(data, tenantId, actor);
  }

  @Patch('employees/:id')
  async updateEmployee(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.hrService.updateEmployee(+id, data, tenantId, actor);
  }

  // Attendance
  @Get('attendance')
  async getAttendance(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.hrService.getAttendance(tenantId);
  }

  @Post('employees/:id/attendance')
  async logAttendance(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.hrService.logAttendance(+id, data, tenantId, actor);
  }

  // Leave Requests
  @Get('leave')
  async getLeaveRequests(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.hrService.getLeaveRequests(tenantId);
  }

  @Post('employees/:id/leave')
  async createLeaveRequest(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.hrService.createLeaveRequest(+id, data, tenantId, actor);
  }

  @Patch('leave/:id')
  async updateLeaveStatus(@Param('id') id: string, @Body('status') status: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const approverUserId = req.user.sub;
    const actor = req.user.email || 'system';
    return this.hrService.updateLeaveStatus(+id, status, approverUserId, tenantId, actor);
  }

  // Performance Reviews
  @Get('reviews')
  async getReviews(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.hrService.getPerformanceReviews(tenantId);
  }

  @Post('employees/:id/reviews')
  async createReview(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const reviewerId = req.user.sub;
    const actor = req.user.email || 'system';
    return this.hrService.createPerformanceReview(+id, reviewerId, data, tenantId, actor);
  }
}
