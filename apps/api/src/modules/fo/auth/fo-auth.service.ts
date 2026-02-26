import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FoLoginDto } from './dto/fo-login.dto';
import { FoSocialLoginDto } from './dto/fo-social-login.dto';
import { FoRefreshTokenDto } from './dto/fo-refresh-token.dto';
import { AuthTokenService } from '../../auth/auth-token.service';

@Injectable()
export class FoAuthService {
  constructor(private readonly authTokenService: AuthTokenService) {}

  login(payload: FoLoginDto) {
    // TODO: replace with FO user lookup + password hash verification
    if (!payload.email || !payload.password) {
      throw new UnauthorizedException('Invalid FO credentials');
    }

    return {
      scope: 'fo',
      loginType: 'email',
      user: {
        email: payload.email,
      },
      ...this.authTokenService.issueTokenPair('fo', payload.email),
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
