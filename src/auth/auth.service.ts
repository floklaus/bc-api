import { Injectable, Logger, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService) { }

  // Generate a JWT token
  generateToken(payload: { app: string }) {
    return this.jwtService.sign(payload);
  }

  // Validate the token (optional additional checks can be added here)
  validateToken(token: string) {

    this.logger.error(`JWT Auth failed: ${token}`);
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      return null;
    }
  }
}