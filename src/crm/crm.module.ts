import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company, Contact, Lead, Pipeline, PipelineStage, Opportunity, Quote, Contract } from './entities/crm.entity';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      Contact,
      Lead,
      Pipeline,
      PipelineStage,
      Opportunity,
      Quote,
      Contract,
    ]),
    FinanceModule,
  ],
  providers: [CrmService],
  controllers: [CrmController],
  exports: [CrmService],
})
export class CrmModule {}
