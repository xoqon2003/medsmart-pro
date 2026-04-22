import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../config/prisma.service';
import { verifyInitData } from '@medsmart/tg-auth';

@Injectable()
export class TgAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async loginFromInitData(initData: string) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new InternalServerErrorException('TELEGRAM_BOT_TOKEN yo\'q');
    }

    const v = verifyInitData(initData, botToken, 3600);
    if (!v.ok || !v.user) {
      throw new UnauthorizedException(`TG verify: ${v.reason ?? 'unknown'}`);
    }

    const tg = v.user;
    const fullName =
      [tg.first_name, tg.last_name].filter(Boolean).join(' ') || `tg_${tg.id}`;

    // Schema: User.telegramId is BigInt? @unique
    const user = await this.prisma.user.upsert({
      where: { telegramId: BigInt(tg.id) },
      update: {
        fullName,
        username: tg.username ?? undefined,
      },
      create: {
        telegramId: BigInt(tg.id),
        username: tg.username ?? null,
        fullName,
        phone: `tg_${tg.id}`, // placeholder — foydalanuvchi keyin yangilaydi
        role: 'PATIENT',
      },
    });

    const token = await this.jwt.signAsync({
      sub: user.id,
      role: user.role,
      src: 'tg',
    });

    return {
      token,
      user: { id: user.id, fullName: user.fullName, role: user.role },
      tg: { id: tg.id, username: tg.username },
    };
  }
}
