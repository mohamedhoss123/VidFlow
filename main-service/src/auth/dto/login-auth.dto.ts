import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class LoginAuthDto {
  @ApiProperty({
    example: "user@example.com",
    description: "The email of the user",
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "password123",
    description: "The password of the user",
    required: true,
  })
  @IsString()
  password: string;
}