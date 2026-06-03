import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, Department, Attendance, LeaveRequest, PerformanceReview } from './entities/hr.entity';
import { User } from '../users/user.entity';
import { FinanceAuditService } from '../finance/services/finance-audit.service';

@Injectable()
export class HrService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(PerformanceReview)
    private readonly performanceReviewRepository: Repository<PerformanceReview>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditService: FinanceAuditService,
  ) {}

  // Departments
  async getDepartments(tenantId: string): Promise<Department[]> {
    return this.departmentRepository.find({ where: { tenantId } });
  }

  async createDepartment(data: any, tenantId: string, actor: string): Promise<Department> {
    const dept = this.departmentRepository.create({ ...data, tenantId }) as unknown as Department;
    const saved = await this.departmentRepository.save(dept) as Department;
    await this.auditService.log(actor, 'DEPARTMENT_CREATED', 'Department', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  // Employees
  async getEmployees(tenantId: string): Promise<Employee[]> {
    return this.employeeRepository.find({
      where: { tenantId },
      relations: {
        user: true,
        department: true,
      },
      order: { employeeNumber: 'ASC' },
    });
  }

  async getEmployee(id: number, tenantId: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id, tenantId },
      relations: {
        user: true,
        department: true,
      },
    });
    if (!employee) throw new NotFoundException(`Employee ${id} not found`);
    return employee;
  }

  async createEmployee(data: any, tenantId: string, actor: string): Promise<Employee> {
    const { userId, departmentId, ...employeeData } = data;
    const employee = this.employeeRepository.create({ ...employeeData, tenantId }) as unknown as Employee;

    if (userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      employee.user = user;
    }
    if (departmentId) {
      const dept = await this.departmentRepository.findOne({ where: { id: departmentId, tenantId } });
      employee.department = dept;
    }

    const saved = await this.employeeRepository.save(employee) as Employee;
    await this.auditService.log(actor, 'EMPLOYEE_CREATED', 'Employee', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  async updateEmployee(id: number, data: any, tenantId: string, actor: string): Promise<Employee> {
    const employee = await this.getEmployee(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(employee));
    const { departmentId, ...employeeData } = data;

    Object.assign(employee, employeeData);

    if (departmentId !== undefined) {
      if (departmentId === null) {
        employee.department = null;
      } else {
        const dept = await this.departmentRepository.findOne({ where: { id: departmentId, tenantId } });
        employee.department = dept;
      }
    }

    const saved = await this.employeeRepository.save(employee) as Employee;
    await this.auditService.log(actor, 'EMPLOYEE_UPDATED', 'Employee', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  // Attendance
  async getAttendance(tenantId: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { tenantId },
      relations: {
        employee: {
          user: true,
        },
      },
      order: { date: 'DESC' },
    });
  }

  async logAttendance(employeeId: number, data: any, tenantId: string, actor: string): Promise<Attendance> {
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId, tenantId } });
    if (!employee) throw new NotFoundException(`Employee ${employeeId} not found`);

    const existing = await this.attendanceRepository.findOne({ where: { employee: { id: employeeId }, date: data.date, tenantId } });
    if (existing) {
      const oldSnapshot = JSON.parse(JSON.stringify(existing));
      Object.assign(existing, data);
      const saved = await this.attendanceRepository.save(existing) as Attendance;
      await this.auditService.log(actor, 'ATTENDANCE_LOGGED', 'Attendance', saved.id.toString(), oldSnapshot, saved, tenantId);
      return saved;
    } else {
      const attendance = this.attendanceRepository.create({
        ...data,
        employee,
        tenantId,
      }) as unknown as Attendance;
      const saved = await this.attendanceRepository.save(attendance) as Attendance;
      await this.auditService.log(actor, 'ATTENDANCE_LOGGED', 'Attendance', saved.id.toString(), null, saved, tenantId);
      return saved;
    }
  }

  // Leave Requests
  async getLeaveRequests(tenantId: string): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      where: { tenantId },
      relations: {
        employee: {
          user: true,
        },
        approvedByUser: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async createLeaveRequest(employeeId: number, data: any, tenantId: string, actor: string): Promise<LeaveRequest> {
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId, tenantId } });
    if (!employee) throw new NotFoundException(`Employee ${employeeId} not found`);

    const request = this.leaveRequestRepository.create({
      ...data,
      employee,
      tenantId,
      status: 'Pending',
    }) as unknown as LeaveRequest;
    const saved = await this.leaveRequestRepository.save(request) as LeaveRequest;
    await this.auditService.log(actor, 'LEAVE_REQUESTED', 'LeaveRequest', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  async updateLeaveStatus(id: number, status: string, approverUserId: number, tenantId: string, actor: string): Promise<LeaveRequest> {
    const request = await this.leaveRequestRepository.findOne({ where: { id, tenantId }, relations: { employee: true } });
    if (!request) throw new NotFoundException(`LeaveRequest ${id} not found`);
    const oldSnapshot = JSON.parse(JSON.stringify(request));

    request.status = status;
    if (approverUserId) {
      const approver = await this.userRepository.findOne({ where: { id: approverUserId } });
      request.approvedByUser = approver;
    }

    const saved = await this.leaveRequestRepository.save(request) as LeaveRequest;
    await this.auditService.log(actor, 'LEAVE_UPDATED', 'LeaveRequest', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  // Performance Reviews
  async getPerformanceReviews(tenantId: string): Promise<PerformanceReview[]> {
    return this.performanceReviewRepository.find({
      where: { tenantId },
      relations: {
        employee: {
          user: true,
        },
        reviewer: true,
      },
      order: { reviewDate: 'DESC' },
    });
  }

  async createPerformanceReview(employeeId: number, reviewerId: number, data: any, tenantId: string, actor: string): Promise<PerformanceReview> {
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId, tenantId } });
    if (!employee) throw new NotFoundException(`Employee ${employeeId} not found`);

    const reviewer = await this.userRepository.findOne({ where: { id: reviewerId } });

    const review = this.performanceReviewRepository.create({
      ...data,
      employee,
      reviewer,
      tenantId,
    }) as unknown as PerformanceReview;

    const saved = await this.performanceReviewRepository.save(review) as PerformanceReview;
    await this.auditService.log(actor, 'PERFORMANCE_REVIEWED', 'PerformanceReview', saved.id.toString(), null, saved, tenantId);
    return saved;
  }
}
