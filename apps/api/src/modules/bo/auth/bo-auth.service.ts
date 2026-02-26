import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BoLoginDto } from './dto/bo-login.dto';
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

    const tokenPair = this.authTokenService.issueTokenPair(
      'bo',
      admin.username,
    );

    return {
      tokenPair,
      data: {
        scope: 'bo',
        loginType: 'username',
        user: {
          username: admin.username,
        },
      },
    };
  }

  refresh(refreshToken: string) {
    return this.authTokenService.rotateRefreshToken('bo', refreshToken);
  }

  async me(accessToken?: string) {
    if (!accessToken) {
      throw new UnauthorizedException('Missing access token');
    }

    const payload = this.authTokenService.verifyAccessToken('bo', accessToken);
    const admin = await this.boAuthRepository.findByUsername(payload.sub);

    if (!admin) {
      throw new NotFoundException('BO admin not found');
    }

    return {
      id: admin.id,
      username: admin.username,
      displayName: admin.displayName,
    };
  }
}
