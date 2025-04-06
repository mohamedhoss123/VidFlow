import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { Express } from "express";

export class UploadVideoDto {
  @ApiProperty({ type: "string" })
  @IsString()
  readonly name: string;
  @ApiProperty({ type: "string" })
  @IsString()
  readonly disc: string;
  @ApiProperty({ type: "string", format: "binary" })
  readonly file: Express.Multer.File;
}
