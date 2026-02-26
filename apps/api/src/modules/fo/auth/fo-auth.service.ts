import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { FoLoginDto } from './dto/fo-login.dto';
import { FoSocialLoginDto } from './dto/fo-social-login.dto';
import { FoRefreshTokenDto } from './dto/fo-refresh-token.dto';
import { AuthTokenService } from '../../auth/auth-token.service';
import { FO_AUTH_REPOSITORY } from './repositories/fo-auth.repository';
import type { FoAuthRepository } from './repositories/fo-auth.repository';

@Injectable()
export class FoAuthService {
  constructor(
    private readonly authTokenService: AuthTokenService,
    @Inject(FO_AUTH_REPOSITORY)
    private readonly foAuthRepository: FoAuthRepository,
  ) {}

  async login(payload: FoLoginDto) {
    if (!payload.email || !payload.password) {
      throw new UnauthorizedException('Invalid FO credentials');
    }

    const user = await this.foAuthRepository.findByEmail(payload.email);

    // NOTE: placeholder password check. replace with secure hash verification.
    if (!user || user.passwordHash !== payload.password) {
      throw new UnauthorizedException('Invalid FO credentials');
    }

    return {
      scope: 'fo',
      loginType: 'email',
      user: {
        email: user.email,
      },
      ...this.authTokenService.issueTokenPair('fo', user.email),
    };
  }

  socialLogin(payload: FoSocialLoginDto) {
    // TODO: implement social provider validation and account linking
    return {
      scope: 'fo',
      loginType: 'social',
      provider: payload.provider,
      ...this.authTokenService.issueTokenPair(
        'fo',
        `${payload.provider}:${payload.accessToken}`,
      ),
    };
  }

  refresh(payload: FoRefreshTokenDto) {
    return this.authTokenService.rotateRefreshToken('fo', payload.refreshToken);
  }
}
