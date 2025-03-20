import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class VideoService {
    constructor(private readonly prismaService :PrismaService){}
    create(name:string,url:string,size:number){
        return this.prismaService.video.create({
            data:{
                name:name,
                url:url,
                size:size
            }
        })    
    }
}
