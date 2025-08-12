import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class LikeService {
    constructor(private readonly prismaService:PrismaService){}

    async addLike(userId:string,videoId:string){
        await this.prismaService.likes.create({data:{user_id:userId,video_id:videoId,created_at: new Date()}})
        await this.prismaService.video.update({where:{id:videoId},data:{likes_count:{increment:1}}})
    }

    async removeLike(userId:string,videoId:string){
        await this.prismaService.likes.deleteMany({where:{user_id:userId,video_id:videoId }})
        await this.prismaService.video.update({where:{id:videoId},data:{likes_count:{decrement:1}}})
    }
}
