import { ApiProperty } from "@nestjs/swagger";

export class CreateThumpnileDto {
  @ApiProperty({ type: "string", format: "binary" })
  readonly thumpmile?: Express.Multer.File;
}
