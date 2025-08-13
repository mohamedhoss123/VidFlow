import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { uuidv7 } from 'uuidv7';
@Injectable()
export class CommentService {
    constructor(private readonly prismaService:PrismaService){}

    async addComment(userId:string,videoId:string,content:string){
        await this.prismaService.comments.create({data:{id:uuidv7(),user_id:userId,video_id:videoId,content:content,created_at: new Date()}})
        await this.prismaService.video.update({where:{id:videoId},data:{comments_count:{increment:1}}})
    }

    async removeComment(userId:string,videoId:string){
        await this.prismaService.comments.deleteMany({where:{user_id:userId,video_id:videoId }})
        await this.prismaService.video.update({where:{id:videoId},data:{comments_count:{decrement:1}}})
    }
}
