import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class KassaService {
  constructor(private prisma: PrismaService) {}

  async openSmena(kassirId: number, kassirIsmi: string, boshlanghichQoldiq: number) {
    // Ochiq smena bormi tekshirish
    const existing = await this.prisma.kassaSmena.findFirst({
      where: { kassirId, holati: 'OCHIQ' },
    });
    if (existing) throw new BadRequestException('Allaqachon ochiq smena mavjud');

    return this.prisma.kassaSmena.create({
      data: { kassirId, kassirIsmi, boshlanghichQoldiq },
    });
  }

  async closeSmena(id: number) {
    const smena = await this.prisma.kassaSmena.findUnique({ where: { id } });
    if (!smena) throw new BadRequestException('Smena topilmadi');

    // Jami hisoblash
    const tolovlar = await this.prisma.kassaTolov.findMany({
      where: { smenaId: id, holati: 'QABUL_QILINDI' },
    });

    let naqd = 0, karta = 0, onlayn = 0;
    for (const t of tolovlar) {
      const sum = Number(t.tolanganSumma);
      if (t.tolovUsuli === 'NAQD') naqd += sum;
      else if (t.tolovUsuli === 'KARTA' || t.tolovUsuli === 'TERMINAL') karta += sum;
      else onlayn += sum;
    }

    return this.prisma.kassaSmena.update({
      where: { id },
      data: {
        holati: 'YOPIQ',
        yopilganVaqt: new Date(),
        naqd, karta, onlayn,
        jami: naqd + karta + onlayn,
        tolovlarSoni: tolovlar.length,
      },
    });
  }

  async createTolov(data: any) {
    const count = await this.prisma.kassaTolov.count();
    const invoiceRaqam = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    return this.prisma.kassaTolov.create({
      data: { ...data, invoiceRaqam },
    });
  }

  async getTolovlar(smenaId: number) {
    return this.prisma.kassaTolov.findMany({
      where: { smenaId },
      orderBy: { sanaVaqt: 'desc' },
    });
  }

  async getActiveSmena(kassirId: number) {
    return this.prisma.kassaSmena.findFirst({
      where: { kassirId, holati: 'OCHIQ' },
      include: { tolovlar: { orderBy: { sanaVaqt: 'desc' } } },
    });
  }
}
