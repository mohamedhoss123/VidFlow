import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { Token } from "./decorator/token.decorator";

@Controller("auths")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("register")
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }
  @Post("login")
  async login(@Body() createUserDto: LoginUserDto) {
    const user = await this.authService.validateUser(createUserDto);
    return {
      token: this.authService.generateToken(user),
      refresh: this.authService.generateRefreshToken({ email: user.email }),
    };
  }

  @Post("refresh")
  refreshToken(@Body("refreshToken") refreshToken: string) {
    const payload = this.authService.verifyRefreshToken(refreshToken);
    return this.authService.generateToken({
      sub: payload.sub,
      email: payload.email,
    });
  }

  @Get("validate")
  validate(@Token() authorization: string) {
    console.log(authorization);
    const token = authorization.split(" ")[1];
    const payload = this.authService.verifyRefreshToken(token);
    if (!payload) {
      throw new UnauthorizedException();
    }
    return { valid: true };
  }
}
