import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'This is a comment',
    description: 'The content of the comment',
    required: true,
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  content: string;
}
