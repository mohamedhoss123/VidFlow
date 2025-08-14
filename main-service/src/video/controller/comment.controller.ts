import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { CommentService } from '../service/comment.service';
import { UserId } from 'src/common/decorator/user-id';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth('access-token') // Match name in addBearerAuth 
@Controller('video')
export class CommentController {

    constructor(private readonly commentService:CommentService){}

    @Post(":videoId/comment")
    async addComment(@Param("videoId") videoId: string,@Body() createCommentDto: CreateCommentDto, @UserId() userId: string) {
        await this.commentService.addComment(userId,videoId,createCommentDto.content);
    }

    @Delete(":videoId/comment")
    async removeComment(@Param("videoId") videoId: string, @UserId() userId: string) {
        await this.commentService.removeComment(userId,videoId);
    }
}
