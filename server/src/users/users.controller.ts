import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // TODO(security): Keyingi sprintda JwtGuard qo'yish kerak.
  // Hozircha RoleSelect va WebPlatformLogin demo ekranlari
  // login oldidan `/users` ni chaqiradi — bular refaktor qilingach,
  // shu endpointga ham @UseGuards(JwtGuard) qo'shiladi.
  @Get()
  async findAll(@Query('role') role?: string) {
    return this.usersService.findAll(role);
  }

  // TODO(security): Keyingi sprintda JwtGuard qo'yish kerak.
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  /**
   * Foydalanuvchi profilini yangilash.
   * Faqat o'zining profilini yoki ADMIN boshqa foydalanuvchilarni
   * o'zgartira oladi.
   */
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
    @Request() req: { user: { sub: number; role: string } },
  ) {
    const isSelf = req.user?.sub === id;
    const isAdmin = req.user?.role === 'ADMIN';
    if (!isSelf && !isAdmin) {
      throw new ForbiddenException(
        "Siz faqat o'z profilingizni o'zgartira olasiz",
      );
    }
    return this.usersService.update(id, data);
  }
}
