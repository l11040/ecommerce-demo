import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { BoLoginDto } from './dto/bo-login.dto';
import { BoRefreshTokenDto } from './dto/bo-refresh-token.dto';
import { AuthTokenService } from '../../auth/auth-token.service';
import { BO_AUTH_REPOSITORY } from './repositories/bo-auth.repository';
import type { BoAuthRepository } from './repositories/bo-auth.repository';

@Injectable()
export class BoAuthService {
  constructor(
    private readonly authTokenService: AuthTokenService,
    @Inject(BO_AUTH_REPOSITORY)
    private readonly boAuthRepository: BoAuthRepository,
  ) {}

  async login(payload: BoLoginDto) {
    if (!payload.username || !payload.password) {
      throw new UnauthorizedException('Invalid BO credentials');
    }

    const admin = await this.boAuthRepository.findByUsername(payload.username);

    // NOTE: placeholder password check. replace with secure hash verification.
    if (!admin || admin.passwordHash !== payload.password) {
      throw new UnauthorizedException('Invalid BO credentials');
    }

    return {
      scope: 'bo',
      loginType: 'username',
      user: {
        username: admin.username,
      },
      ...this.authTokenService.issueTokenPair('bo', admin.username),
    };
  }

  refresh(payload: BoRefreshTokenDto) {
    return this.authTokenService.rotateRefreshToken('bo', payload.refreshToken);
  }
}
