import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from "argon2";
import { LoginUserDto } from './dto/login-user.dto';
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService,private readonly prismaService: PrismaService) {}

  generateToken(payload: object) {
    return this.jwtService.sign(payload);
  }
  generateRefreshToken(payload: object) {
    return this.jwtService.sign(payload,{expiresIn:"7d"});
  }
  verifyRefreshToken(token: string) {
    return this.jwtService.verify(token);
  }
  async createUser(createUserDto: CreateUserDto) {
    const user = await this.prismaService.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password:await argon2.hash(createUserDto.password),
      },
    });
    return user;
  }
  async getUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });
  }
  async validateUser(payload:LoginUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: payload.email,
      },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const isPasswordValid = await argon2.verify(user.password, payload.password);
    if (isPasswordValid) {
      return user;
    }
    throw new BadRequestException();
  }
  
}

