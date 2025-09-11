import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString, IsInt, Min } from "class-validator";

export class CommentPaginationDto {
  @ApiPropertyOptional({
    example: 10,
    description: "Number of items per page",
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: "vid123",
    description: "Cursor for pagination",
  })
  @IsOptional()
  @IsString()
  cursor?: string;
}
