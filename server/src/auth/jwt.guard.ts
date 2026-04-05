import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token topilmadi');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwt.verify(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException("Noto'g'ri yoki eskirgan token");
    }
  }
}
