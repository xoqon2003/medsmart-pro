import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class SemanticSearchDto {
  @ApiProperty({
    example: "yurak og'rig'i va nafas qisilishi",
    description: 'Semantik qidiruv matni (3–500 belgi)',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  query!: string;
}
