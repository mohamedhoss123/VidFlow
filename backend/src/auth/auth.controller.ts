import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';


@Controller('auths')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }
  @Post('login')
  async login(@Body() createUserDto: LoginUserDto) {
    const user = await this.authService.validateUser(createUserDto);
    return {token: this.authService.generateToken(user),refresh:this.authService.generateRefreshToken({email:user.email})};
  }

  @Post('refresh')
  async refresh() {
    const user = await this.authService.getUserByEmail(createUserDto.email);
    return {token: this.authService.generateToken(user),refresh:this.authService.generateRefreshToken({email:user.email})};
  }

}
