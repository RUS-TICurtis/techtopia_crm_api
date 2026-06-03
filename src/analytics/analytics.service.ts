import { Injectable } from '@nestjs/common';
import { CrmService } from '../crm/crm.service';
import { ProjectsService } from '../projects/projects.service';
import { InvoicesService } from '../finance/services/invoices.service';
import { PaymentsService } from '../finance/services/payments.service';
import { HrService } from '../hr/hr.service';
import { SupportService } from '../support/support.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly crmService: CrmService,
    private readonly projectsService: ProjectsService,
    private readonly invoicesService: InvoicesService,
    private readonly paymentsService: PaymentsService,
    private readonly hrService: HrService,
    private readonly supportService: SupportService,
  ) {}

  async getDashboardSummary(tenantId: string) {
    const leads = await this.crmService.getLeads(tenantId);
    const opportunities = await this.crmService.getOpportunities(tenantId);
    const projects = await this.projectsService.findAll(tenantId);
    const invoices = await this.invoicesService.findAll(tenantId);
    
    // We get payments and handle potential errors or empty returns
    let payments: any[] = [];
    try {
      payments = await this.paymentsService.findAll(tenantId);
    } catch {
      payments = [];
    }

    const employees = await this.hrService.getEmployees(tenantId);
    const tickets = await this.supportService.findAll(tenantId);

    // Aggregations
    const activeLeads = leads.filter(l => l.status !== 'Qualified').length;
    const wonOpportunities = opportunities.filter(o => o.stage === 'Closed Won');
    const totalWonValue = wonOpportunities.reduce((sum, o) => sum + (o.amount || 0), 0);

    const activeProjects = projects.filter(p => p.status === 'In Progress').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;

    const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalOutstanding = Math.max(0, totalInvoiced - totalCollected);

    const employeeCount = employees.length;

    const openTickets = tickets.filter(t => t.status === 'Open').length;
    const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;

    return {
      crm: {
        totalLeads: leads.length,
        activeLeads,
        totalOpportunities: opportunities.length,
        totalWonValue,
        wonCount: wonOpportunities.length,
      },
      projects: {
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
      },
      finance: {
        totalInvoiced,
        totalCollected,
        totalOutstanding,
      },
      hr: {
        employeeCount,
      },
      support: {
        totalTickets: tickets.length,
        openTickets,
        resolvedTickets,
      },
    };
  }
}
