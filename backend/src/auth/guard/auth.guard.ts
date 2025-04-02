import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: { authorization: string | undefined } }>();
    const headers = request.headers;
    console.log(headers);
    const token = headers.authorization?.split(" ")[1];
    if (!token || !this.authService.verifyRefreshToken(token)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
