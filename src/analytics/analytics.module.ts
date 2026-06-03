import { Module } from '@nestjs/common';
import { CrmModule } from '../crm/crm.module';
import { ProjectsModule } from '../projects/projects.module';
import { FinanceModule } from '../finance/finance.module';
import { HrModule } from '../hr/hr.module';
import { SupportModule } from '../support/support.module';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [
    CrmModule,
    ProjectsModule,
    FinanceModule,
    HrModule,
    SupportModule,
  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
