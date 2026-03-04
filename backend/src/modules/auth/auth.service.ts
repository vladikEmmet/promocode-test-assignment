import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserDocument } from '../users/user.schema';

interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) {}

    async register(dto: RegisterDto): Promise<TokenPair> {
        const user = await this.usersService.create(dto);
        return this.generateTokens(user);
    }

    async login(dto: LoginDto): Promise<TokenPair> {
        const user = await this.usersService.findByEmailWithPassword(dto.email);

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateTokens(user);
    }

    async refresh(refreshToken: string): Promise<TokenPair> {
        try {
            const payload = this.jwtService.verify<{ sub: string; email: string }>(
                refreshToken,
                { secret: this.config.get<string>('jwt.refreshSecret') },
            );

            const user = await this.usersService.findById(payload.sub);
            if (!user || !user.isActive) throw new UnauthorizedException();

            return this.generateTokens(user);
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    private generateTokens(user: UserDocument): TokenPair {
        const payload = { sub: user._id.toString(), email: user.email };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.config.get<string>('jwt.accessSecret'),
            expiresIn: this.config.get<string>('jwt.accessExpiresIn') as StringValue,
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.config.get<string>('jwt.refreshSecret'),
            expiresIn: this.config.get<string>('jwt.refreshExpiresIn') as StringValue,
        });

        return { accessToken, refreshToken };
    }
}