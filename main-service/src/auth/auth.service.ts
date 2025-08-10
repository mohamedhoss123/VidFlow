import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { uuidv7 } from 'uuidv7';
import { LoginAuthDto } from './dto/login-auth.dto';
import argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService){}
  async create(createAuthDto: CreateAuthDto) {
     const password =await argon2.hash(createAuthDto.password);
     createAuthDto.password = password;
    return this.prisma.users.create({
      data: {...createAuthDto,id: uuidv7(),created_at: new Date()},
    });
  }

  async login(loginAuthDto: LoginAuthDto){
    const user =await this.prisma.users.findFirstOrThrow({
      where: {
        email: loginAuthDto.email,
      },
    });
    const isPasswordValid = await argon2.verify(user.password!, loginAuthDto.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }    
    const token = await this.createToken(user.id);
    const refresh = await this.createRefresh(user.id);
    return {token,refresh};
  }

  async createToken(userId: string){
    const token = jwt.sign({ user_id:userId }, process.env.JWT_SECRET||"");
    return token;
  }

  async createRefresh(userId: string){
    const id= uuidv7()
    await this.prisma.refreshTokens.create({data:{user_id: userId,expires_at: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), id,created_at: new Date()}})
    return id;
  }
  async refresh(refreshToken: string){
    const token =await this.prisma.refreshTokens.findFirstOrThrow({ 
      where: {
        id: refreshToken,
      },
    });
    if(token.expires_at < new Date()){
      throw new Error('Refresh token expired');
    }
    await this.prisma.refreshTokens.update({
      where: {
        id: refreshToken,
      },
      data: {
        expires_at: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
      },
    })
    const refresh =await this.createRefresh(token.user_id);    
    return {token,refresh};
  }
}
