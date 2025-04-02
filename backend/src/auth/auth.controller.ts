import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { AuthGuard } from "./guard/auth.guard";

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

  @UseGuards(AuthGuard)
  @Get("validate")
  validate() {
    return { valid: true };
  }
}
