import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company, Contact, Lead, Pipeline, PipelineStage, Opportunity, Quote, Contract } from './entities/crm.entity';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { ContractsController } from './contracts.controller';
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
  controllers: [CrmController, ContractsController],
  exports: [CrmService],
})
export class CrmModule {}
