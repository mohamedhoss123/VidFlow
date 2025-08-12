import { Param, Controller, Delete, Post } from '@nestjs/common';
import { LikeService } from '../service/like.service';
import { UserId } from 'src/common/decorator/user-id';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth('access-token') // Match name in addBearerAuth 
@Controller('video')
export class LikeController {

    constructor(private readonly likeService: LikeService){}

    @Post(':videoId/like')
    async addLike(@Param('videoId') videoId: string, @UserId() userId: string) {
        await this.likeService.addLike(userId,videoId);
    }

    @Delete(':videoId/like')
    async removeLike(@Param('videoId') videoId: string, @UserId() userId: string) {
        await this.likeService.removeLike(userId,videoId);
    }

}
