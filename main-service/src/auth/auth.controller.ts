import { Controller, Get, Post, Body, Patch, Param, Delete, Catch, UseFilters, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { PrismaExceptionFilter } from './filter/prisma-exception.filter';
import { Cookies } from './decorator/cookie';
import { type Response } from 'express';

@Controller('auth')
@UseFilters(new PrismaExceptionFilter())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() loginAuthDto: LoginAuthDto,@Res() res: Response) {
    const {token,refresh} = await this.authService.login(loginAuthDto);
    console.log(refresh)
    res.cookie("refreshToken",refresh,{
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7 * 1000
    })
    res.send({token})
  }

  @Post("register")
  async register(@Body() createAuthDto: CreateAuthDto){
    await this.authService.create(createAuthDto);
    return 201
  }

  @Post("refresh")
  async refresh(@Cookies("refreshToken") refreshToken: string,@Res() res: Response){
    const {token,refresh} = await this.authService.refresh(refreshToken);
    res.cookie("refreshToken",refresh,{
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7 * 1000
    })
    return {token}
  }
}
