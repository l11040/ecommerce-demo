import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BoLoginDto } from './dto/bo-login.dto';
import { BoRefreshTokenDto } from './dto/bo-refresh-token.dto';
import { AuthTokenService } from '../../auth/auth-token.service';

@Injectable()
export class BoAuthService {
  constructor(private readonly authTokenService: AuthTokenService) {}

  login(payload: BoLoginDto) {
    // TODO: replace with BO admin lookup + password hash verification
    if (!payload.username || !payload.password) {
      throw new UnauthorizedException('Invalid BO credentials');
    }

    return {
      scope: 'bo',
      loginType: 'username',
      user: {
        username: payload.username,
      },
      ...this.authTokenService.issueTokenPair('bo', payload.username),
    };
  }

  refresh(payload: BoRefreshTokenDto) {
    return this.authTokenService.rotateRefreshToken('bo', payload.refreshToken);
  }
}
