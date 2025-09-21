import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MemberContribution } from './entities/member-contribution.entity';
import { ContributionFilterDto } from './dto/contribution-filter.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { GenerateContributionsDto } from './dto/generate-contributions.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(MemberContribution)
    private readonly repo: Repository<MemberContribution>,
    private readonly usersService: UsersService,
  ) {}

  async getContributions(filterDto: ContributionFilterDto) {
    const qb = this.repo.createQueryBuilder('c').leftJoinAndSelect('c.member', 'member');

    if (filterDto.memberId) qb.andWhere('member.id = :memberId', { memberId: filterDto.memberId });
    if (filterDto.status) qb.andWhere('c.status = :status', { status: filterDto.status });
    if (filterDto.contributionType) qb.andWhere('c.contributionType = :type', { type: filterDto.contributionType });
    if (filterDto.startDate) qb.andWhere('c.dueDate >= :start', { start: filterDto.startDate });
    if (filterDto.endDate) qb.andWhere('c.dueDate <= :end', { end: filterDto.endDate });

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    qb.skip(offset).take(limit).orderBy('c.dueDate', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

async createContribution(dto: CreateContributionDto) {
  const member = await this.usersService.findOne(dto.memberId); // Changed from findById to findOne
  const entity = this.repo.create({
    member,
    amount: dto.amount,
    dueDate: new Date(dto.dueDate),
    contributionType: dto.contributionType || 'monthly',
    status: 'pending',
  });
  return this.repo.save(entity);
}

  async generateMonthlyContributions(dto: GenerateContributionsDto) {
    // In a real impl, we'd fetch all members. Here, return an acknowledgement.
    return { success: true };
  }

  async markContributionAsPaid(id: string, payment: MarkPaidDto) {
    await this.repo.update(id, {
      status: 'paid',
      paidDate: new Date(payment.paidDate),
      transactionId: payment.transactionId,
    });
    return this.repo.findOne({ where: { id } });
  }

  async getOverdueContributions() {
    const today = new Date();
    return this.repo.find({ where: { status: 'overdue' as any, dueDate: Between(new Date(0) as any, today as any) } as any });
  }

  async sendContributionReminders(_dto: { daysBeforeDue?: number }) {
    return { success: true };
  }
}
