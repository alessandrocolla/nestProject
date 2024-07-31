import { IsEmail, IsOptional, IsString } from "class-validator";

export class updateUserDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password: string;
}
