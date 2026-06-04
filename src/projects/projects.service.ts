import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project, Milestone, Task, Comment } from './entities/project.entity';
import { User } from '../users/user.entity';
import { FinanceAuditService } from '../finance/services/finance-audit.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Milestone)
    private readonly milestoneRepository: Repository<Milestone>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditService: FinanceAuditService,
  ) {}

  async findAll(tenantId: string): Promise<Project[]> {
    return this.projectRepository.find({
      where: { tenantId },
      relations: {
        members: true,
        milestones: true,
        tasks: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, tenantId: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id, tenantId },
      relations: {
        members: true,
        milestones: true,
        tasks: {
          comments: {
            user: true,
          },
        },
      },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async create(data: any, tenantId: string, actor: string): Promise<Project> {
    const { memberIds, ...projectData } = data;
    const project = this.projectRepository.create({
      ...projectData,
      name: projectData.name || projectData.title,
      tenantId,
    }) as unknown as Project;

    if (memberIds && memberIds.length > 0) {
      const users = await this.userRepository.findBy({ id: In(memberIds) });
      project.members = users;
    }

    const saved = await this.projectRepository.save(project) as unknown as Project;
    await this.auditService.log(actor, 'PROJECT_CREATED', 'Project', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  async update(id: number, data: any, tenantId: string, actor: string): Promise<Project> {
    const project = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(project));

    const { memberIds, ...projectData } = data;
    if (projectData.title) {
      projectData.name = projectData.title;
    }
    Object.assign(project, projectData);

    if (memberIds) {
      const users = await this.userRepository.findBy({ id: In(memberIds) });
      project.members = users;
    }

    const saved = await this.projectRepository.save(project) as unknown as Project;
    await this.auditService.log(actor, 'PROJECT_UPDATED', 'Project', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  async remove(id: number, tenantId: string, actor: string): Promise<void> {
    const project = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(project));
    await this.projectRepository.remove(project);
    await this.auditService.log(actor, 'PROJECT_DELETED', 'Project', id.toString(), oldSnapshot, null, tenantId);
  }

  // Tasks
  async getTasks(projectId: number, tenantId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { project: { id: projectId }, tenantId },
      relations: {
        milestone: true,
        comments: {
          user: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async createTask(projectId: number, data: any, tenantId: string, actor: string): Promise<Task> {
    const project = await this.projectRepository.findOne({ where: { id: projectId, tenantId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    const { milestoneId, ...taskData } = data;
    const task = this.taskRepository.create({
      ...taskData,
      project,
      tenantId,
    }) as unknown as Task;

    if (milestoneId) {
      const milestone = await this.milestoneRepository.findOne({ where: { id: milestoneId, tenantId } });
      task.milestone = milestone;
    }

    const saved = await this.taskRepository.save(task) as unknown as Task;
    await this.auditService.log(actor, 'TASK_CREATED', 'Task', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  async updateTask(taskId: number, data: any, tenantId: string, actor: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId, tenantId },
      relations: {
        project: true,
        milestone: true,
      },
    });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);
    const oldSnapshot = JSON.parse(JSON.stringify(task));

    const { milestoneId, ...taskData } = data;
    Object.assign(task, taskData);

    if (milestoneId !== undefined) {
      if (milestoneId === null) {
        task.milestone = null;
      } else {
        const milestone = await this.milestoneRepository.findOne({ where: { id: milestoneId, tenantId } });
        task.milestone = milestone;
      }
    }

    const saved = await this.taskRepository.save(task) as unknown as Task;
    await this.auditService.log(actor, 'TASK_UPDATED', 'Task', taskId.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  // Milestones
  async getMilestones(projectId: number, tenantId: string): Promise<Milestone[]> {
    return this.milestoneRepository.find({
      where: { project: { id: projectId }, tenantId },
      order: { dueDate: 'ASC' },
    });
  }

  async createMilestone(projectId: number, data: any, tenantId: string, actor: string): Promise<Milestone> {
    const project = await this.projectRepository.findOne({ where: { id: projectId, tenantId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    const milestone = this.milestoneRepository.create({
      ...data,
      project,
      tenantId,
    }) as unknown as Milestone;

    const saved = await this.milestoneRepository.save(milestone) as unknown as Milestone;
    await this.auditService.log(actor, 'MILESTONE_CREATED', 'Milestone', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  // Comments
  async addComment(taskId: number, content: string, userId: number, tenantId: string): Promise<Comment> {
    const task = await this.taskRepository.findOne({ where: { id: taskId, tenantId } });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const comment = this.commentRepository.create({
      task,
      user,
      content,
      tenantId,
    }) as unknown as Comment;

    return this.commentRepository.save(comment) as Promise<Comment>;
  }

  async getComments(taskId: number, tenantId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { task: { id: taskId }, tenantId },
      relations: {
        user: true,
      },
      order: { createdAt: 'ASC' },
    });
  }

  async getAllTasks(tenantId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { tenantId },
      relations: {
        project: true,
        milestone: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async createTaskGlobal(data: any, tenantId: string, actor: string): Promise<Task> {
    let project = null;
    if (data.projectId) {
      project = await this.projectRepository.findOne({ where: { id: +data.projectId, tenantId } });
    }
    if (!project) {
      project = await this.projectRepository.findOne({ where: { tenantId } });
    }
    if (!project) {
      project = this.projectRepository.create({
        name: 'General Tasks',
        description: 'Default project for general CRM tasks',
        tenantId,
        status: 'In Progress',
      }) as unknown as Project;
      project = await this.projectRepository.save(project) as unknown as Project;
    }

    const task = this.taskRepository.create({
      name: data.title || data.name,
      description: data.description || null,
      priority: data.priority || 'Medium',
      status: data.status === 'Completed' || data.status === 'Done' ? 'Done' : 'Todo',
      dueDate: data.date || data.dueDate || null,
      contactId: data.contactId || null,
      contactName: data.contactName || null,
      project,
      tenantId,
    }) as unknown as Task;

    const saved = await this.taskRepository.save(task) as unknown as Task;
    await this.auditService.log(actor, 'TASK_CREATED', 'Task', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  async deleteTaskGlobal(taskId: number, tenantId: string, actor: string): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id: taskId, tenantId } });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);
    const oldSnapshot = JSON.parse(JSON.stringify(task));
    await this.taskRepository.remove(task);
    await this.auditService.log(actor, 'TASK_DELETED', 'Task', taskId.toString(), oldSnapshot, null, tenantId);
  }
}
