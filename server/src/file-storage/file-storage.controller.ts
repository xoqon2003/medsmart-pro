import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileStorageService, UploadedFile as IUploadedFile } from './file-storage.service';
import { JwtGuard } from '../auth/jwt.guard';

@ApiTags('File Storage')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('files')
export class FileStorageController {
  constructor(private fileStorage: FileStorageService) {}

  @Post('avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: IUploadedFile, @Req() req: any) {
    return this.fileStorage.uploadAvatar(file, req.user.id);
  }

  @Post('document/:applicationId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: IUploadedFile,
    @Param('applicationId') applicationId: string,
  ) {
    return this.fileStorage.uploadDocument(file, applicationId);
  }

  @Post('conclusion/:conclusionId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  async uploadConclusion(
    @UploadedFile() file: IUploadedFile,
    @Param('conclusionId') conclusionId: string,
  ) {
    return this.fileStorage.uploadConclusion(file, conclusionId);
  }

  @Post('portfolio/:doctorId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  async uploadPortfolio(
    @UploadedFile() file: IUploadedFile,
    @Param('doctorId') doctorId: string,
  ) {
    return this.fileStorage.uploadPortfolioImage(file, doctorId);
  }

  @Delete(':bucket/:key')
  async deleteFile(
    @Param('bucket') bucket: string,
    @Param('key') key: string,
  ) {
    await this.fileStorage.delete(bucket, key);
    return { message: "Fayl o'chirildi" };
  }

  @Get('signed-url')
  async getSignedUrl(
    @Query('bucket') bucket: string,
    @Query('key') key: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    const url = await this.fileStorage.getSignedUrl(
      bucket,
      key,
      expiresIn ? parseInt(expiresIn, 10) : undefined,
    );
    return { url };
  }
}
