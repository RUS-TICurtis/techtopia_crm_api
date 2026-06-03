import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee, Department, Attendance, LeaveRequest, PerformanceReview } from './entities/hr.entity';
import { User } from '../users/user.entity';
import { HrService } from './hr.service';
import { HrController } from './hr.controller';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      Department,
      Attendance,
      LeaveRequest,
      PerformanceReview,
      User,
    ]),
    FinanceModule,
  ],
  providers: [HrService],
  controllers: [HrController],
  exports: [HrService],
})
export class HrModule {}
