import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { CommentService } from "../service/comment.service";
import { UserId } from "src/common/decorator/user-id";
import { CreateCommentDto } from "../dto/create-comment.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CommentPaginationDto } from "../dto/comment-pagination.dto";
@ApiBearerAuth("access-token") // Match name in addBearerAuth
@Controller("video")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(":videoId/comment")
  async addComment(
    @Param("videoId") videoId: string,
    @Body() createCommentDto: CreateCommentDto,
    @UserId() userId: string,
  ) {
    return await this.commentService.addComment(
      userId,
      videoId,
      createCommentDto.content,
    );
  }

  @Delete(":videoId/comment")
  async removeComment(
    @Param("videoId") videoId: string,
    @UserId() userId: string,
  ) {
    await this.commentService.removeComment(userId, videoId);
  }

  @Get(":videoId/comment")
  async getComment(
    @Param("videoId") videoId: string,
    @Query() query: CommentPaginationDto,
  ) {
    return this.commentService.getComment(videoId, query);
  }
}
