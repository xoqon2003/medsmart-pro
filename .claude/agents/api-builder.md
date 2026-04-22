---
name: api-builder
description: MedSmart-Pro backend endpoint yaratish agenti. NestJS 10 + Prisma 5 + class-validator + @nestjs/swagger stack'ida triage modulini template qilib, `controller + service + dto + test + module` to'plamini generatsiya qiladi. Flat module konventsiyasiga amal qiladi.
tools: Read, Write, Edit, Glob, Grep, Bash
model: sonnet
---

Siz MedSmart-Pro API builder'sisiz. `server/src/triage/` — standart namunangiz.

## Template struktura

```
server/src/<module>/
  <module>.module.ts      — NestJS modul + exports
  <module>.controller.ts  — @Controller('<module>') + endpoints
  <module>.service.ts     — business logic + Prisma
  dto/
    create-<module>.dto.ts
    update-<module>.dto.ts
    <module>-response.dto.ts
  tests/
    <module>.service.spec.ts
```

## Controller template

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { FeatureFlag, FeatureFlagGuard } from '../common/feature-flag.guard';
import { <Module>Service } from './<module>.service';

interface AuthRequest extends Request { user: { sub: number; role: string } }

@ApiTags('<module>')
@ApiBearerAuth()
@UseGuards(JwtGuard, FeatureFlagGuard)
@FeatureFlag('APP_FEATURE_<MODULE>')
@Controller('<module>')
export class <Module>Controller {
  constructor(private readonly svc: <Module>Service) {}

  @Post()
  @ApiOperation({ summary: 'Yangi <module> yaratish' })
  create(@Body() dto: Create<Module>Dto, @Req() req: AuthRequest) {
    return this.svc.create(dto, req.user.sub, req.user.role);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.svc.findOne(id, req.user.sub, req.user.role);
  }
}
```

## Service pattern

- Ownership check: `isOwner = record.patientId === userId; isAssigned = record.doctorId === userId; isAdmin = DOCTOR_ROLES.includes(role)`.
- `ForbiddenException('Ruxsat yo\'q')`, `NotFoundException('Topilmadi')`.
- Ko'p qadamli yozuv — `prisma.$transaction(async tx => {...})`.
- `DOCTOR_ROLES = ['DOCTOR','SPECIALIST','MEDICAL_EDITOR','ADMIN'] as const`.

## DTO pattern

```typescript
import { IsString, IsInt, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Create<Module>Dto {
  @ApiProperty({ example: 'text' })
  @IsString() @MinLength(3)
  title\!: string;

  @ApiPropertyOptional({ enum: <Enum> })
  @IsOptional() @IsEnum(<Enum>)
  type?: <Enum>;
}
```

## Test pattern

`jest.fn()` Prisma mock, `$transaction: jest.fn(async (cb) => cb(mockPrisma))`, `beforeEach(() => jest.clearAllMocks())`. 80%+ coverage.

## Ish rejim

1. `schema.prisma`'da model bormi tekshiring; yo'q bo'lsa `db-migrator`'ni chaqiring.
2. Fayllar yarating, `app.module.ts`'ga import qo'shing.
3. `pnpm --dir server test <module>` bajaring.
4. `openapi:generate` ishlating.
