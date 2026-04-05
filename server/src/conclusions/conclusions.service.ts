import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class ConclusionsService {
  constructor(private prisma: PrismaService) {}

  async findByApplication(applicationId: number) {
    return this.prisma.conclusion.findMany({
      where: { applicationId },
      include: { author: { select: { id: true, fullName: true, role: true, specialty: true } } },
      orderBy: { signedAt: 'desc' },
    });
  }

  async create(applicationId: number, data: any) {
    const conclusion = await this.prisma.conclusion.create({
      data: { ...data, applicationId },
      include: { author: { select: { id: true, fullName: true, role: true } } },
    });

    // Audit log
    await this.prisma.auditEvent.create({
      data: {
        applicationId,
        action: 'CONCLUSION_ADDED',
        actorId: data.authorId,
        details: { conclusionType: data.conclusionType },
      },
    });

    return conclusion;
  }
}
