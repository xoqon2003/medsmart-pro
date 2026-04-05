import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

const EXAMS_BY_CATEGORY: Record<string, string[]> = {
  visual: ['MRT bosh', 'MRT umurtqa', 'KT qorin', 'KT ko\'krak', 'Rentgen o\'pka', 'Flyuorografiya', 'Mammografiya'],
  ultrasound: ['UZI qorin', 'UZI yurak (EXO-KG)', 'UZI tireoid', 'UZI buyrak', 'UZI jigar'],
  laboratory: ['Umumiy qon tahlili', 'Bioximiya', 'Gormon tahlili', 'Gepatit B/C', 'Qand miqdori'],
  functional: ['EKG', 'EEG', 'Spirometriya', 'Veloergometriya'],
  endoscopy: ['FGDS (gastroskopiya)', 'Kolonoskopiya', 'Bronxoskopiya'],
};

@Injectable()
export class ExaminationsService {
  constructor(private prisma: PrismaService) {}

  async getCenters(filters?: { region?: string; district?: string }) {
    const where: any = {};
    if (filters?.region) where.region = filters.region;
    if (filters?.district) where.district = filters.district;

    return this.prisma.examinationCenter.findMany({ where, orderBy: { rating: 'desc' } });
  }

  async getExamsByCategory(category: string) {
    return EXAMS_BY_CATEGORY[category] || [];
  }
}
