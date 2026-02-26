import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FoLoginDto } from './dto/fo-login.dto';
import { FoSocialLoginDto } from './dto/fo-social-login.dto';
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

    const tokenPair = this.authTokenService.issueTokenPair('fo', user.email);

    return {
      tokenPair,
      data: {
        scope: 'fo',
        loginType: 'email',
        user: {
          email: user.email,
        },
      },
    };
  }

  socialLogin(payload: FoSocialLoginDto) {
    // TODO: implement social provider validation and account linking
    const tokenPair = this.authTokenService.issueTokenPair(
      'fo',
      `${payload.provider}:${payload.accessToken}`,
    );

    return {
      tokenPair,
      data: {
        scope: 'fo',
        loginType: 'social',
        provider: payload.provider,
      },
    };
  }

  refresh(refreshToken: string) {
    return this.authTokenService.rotateRefreshToken('fo', refreshToken);
  }

  async me(accessToken?: string) {
    if (!accessToken) {
      throw new UnauthorizedException('Missing access token');
    }

    const payload = this.authTokenService.verifyAccessToken('fo', accessToken);
    const user = await this.foAuthRepository.findByEmail(payload.sub);

    if (!user) {
      throw new NotFoundException('FO user not found');
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }
}
