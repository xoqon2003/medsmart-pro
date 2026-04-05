import { IsString, IsNotEmpty, Length, Matches, IsOptional } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Telefon raqam kiritilishi shart' })
  @Matches(/^\+998\d{9}$/, { message: "Telefon formati: +998XXXXXXXXX" })
  phone: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998\d{9}$/, { message: "Telefon formati: +998XXXXXXXXX" })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP kodi 6 raqamdan iborat' })
  otp: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998\d{9}$/, { message: "Telefon formati: +998XXXXXXXXX" })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 6, { message: 'PIN kodi 4-6 raqamdan iborat' })
  pin: string;
}

export class SetPinDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998\d{9}$/, { message: "Telefon formati: +998XXXXXXXXX" })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 6, { message: 'PIN kodi 4-6 raqamdan iborat' })
  pin: string;
}

export class TelegramAuthDto {
  @IsString()
  @IsNotEmpty({ message: 'initData kiritilishi shart' })
  initData: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Refresh token kiritilishi shart' })
  refreshToken: string;
}

export class RegisterPatientDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998\d{9}$/, { message: "Telefon formati: +998XXXXXXXXX" })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Ism kiritilishi shart' })
  fullName: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  birthDate?: string;
}
