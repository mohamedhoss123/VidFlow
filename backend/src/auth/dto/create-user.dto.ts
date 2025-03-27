import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
  @ApiProperty({
    example: "John Doe",
    description: "The name of the user",
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    example: "john.doe@example.com",
    description: "The email address of the user",
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    example: "password123",
    description: "The password of the user",
  })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
