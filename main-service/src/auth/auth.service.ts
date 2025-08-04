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
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET||"");
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET||"");
    return {token,refreshToken};
  }
}
