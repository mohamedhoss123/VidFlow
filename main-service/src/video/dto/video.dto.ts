import { IsString, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// Input DTO for GET request (e.g., /video/:videoId)
export class GetVideoDto {
  @ApiProperty({ description: 'The ID of the video', example: 123 })
  @IsString()
  @Min(1)
  @Type(() => Number)
  videoId: string;
}

// Response DTO for video and its qualities
export class VideoQualityResponseDto {
  @ApiProperty({ description: 'Video resolution or quality option', example: '1080p', nullable: true })
  quality: string | null;
  @ApiProperty({ description: 'Source URL for this quality', example: 'https://example.com/video-1080p.mp4', nullable: true })
  source: string | null;

}

export class VideoResponseDto {
  @ApiProperty({ description: 'Video ID', example: 'vid123' })
  id: string;

  @ApiProperty({ description: 'Video name', example: 'My Awesome Video', nullable: true })
  name: string | null;

  @ApiProperty({ description: 'Video description', example: 'This is a description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'User ID of the video owner', example: 'user456', nullable: true })
  user_id: string | null;

  @ApiProperty({ description: 'Number of likes', example: 120, nullable: true })
  likes_count: number | null;

  @ApiProperty({ description: 'Number of comments', example: 45, nullable: true })
  comments_count: number | null;

  @ApiProperty({ description: 'Video visibility status', example: 'PUBLIC', nullable: true })
  visibility: string | null;



  @ApiProperty({ description: 'Video creation date', example: '2025-08-10T12:34:56.000Z', nullable: true })
  created_at: Date | null;

  @ApiProperty({ description: 'Available qualities for this video', type: [VideoQualityResponseDto] })
  qualities: VideoQualityResponseDto[];
}