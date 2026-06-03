import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @Column({ unique: true })
  employeeNumber: string;

  @Column()
  jobTitle: string;

  @Column({ type: 'float', nullable: true })
  salary: number | null;

  @Column({ type: 'varchar', nullable: true })
  hireDate: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee | null;

  @Column({ type: 'varchar' })
  date: string;

  @Column({ type: 'varchar', nullable: true })
  checkIn: string | null;

  @Column({ type: 'varchar', nullable: true })
  checkOut: string | null;

  @Column({ type: 'varchar', default: 'Present' })
  status: string; // Present, Absent, Late, On Leave

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee | null;

  @Column()
  leaveType: string;

  @Column({ type: 'varchar' })
  startDate: string;

  @Column({ type: 'varchar' })
  endDate: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'varchar', default: 'Pending' })
  status: string; // Pending, Approved, Rejected, Cancelled

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by_user_id' })
  approvedByUser: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('performance_reviews')
export class PerformanceReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User | null;

  @Column({ type: 'varchar' })
  reviewDate: string;

  @Column()
  period: string;

  @Column({ type: 'integer' })
  rating: number; // 1 to 5

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
