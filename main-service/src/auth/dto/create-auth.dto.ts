import { ApiProperty, ApiTags } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

@ApiTags("auth")
export class CreateAuthDto {
    @ApiProperty({
        example: "John Doe",
        description: "The name of the user",
        required: true,
    })
    @IsString()
    name: string;
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
