import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TgLoginDto {
  @ApiProperty({
    description: 'window.Telegram.WebApp.initData raw string',
    example: 'query_id=AAHd...&user=%7B%22id%22%3A42%7D&auth_date=1712345678&hash=abc...',
  })
  @IsString()
  @MinLength(20)
  initData!: string;
}
