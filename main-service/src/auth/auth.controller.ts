import { Controller, Get, Post, Body, Patch, Param, Delete, Catch, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { PrismaExceptionFilter } from './filter/prisma-exception.filter';

@Controller('auth')
@UseFilters(new PrismaExceptionFilter())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Post("register")
  async register(@Body() createAuthDto: CreateAuthDto){
    await this.authService.create(createAuthDto);
    return 201

  }
}
