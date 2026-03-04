import {Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards} from '@nestjs/common';
import {ApiTags, ApiOperation, ApiBearerAuth} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { TokenPairDto } from './dto/token-pair.dto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {JwtAuthGuard} from "./guards/jwt-auth.guard";
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import type {UserDocument} from "../users/user.schema";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register new user' })
    register(@Body() dto: RegisterDto): Promise<TokenPairDto> {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ medium: { ttl: 60_000, limit: 10 } })
    @ApiOperation({ summary: 'Login with email and password' })
    login(@Body() dto: LoginDto): Promise<TokenPairDto> {
        return this.authService.login(dto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    refresh(@Body('refreshToken') refreshToken: string): Promise<TokenPairDto> {
        return this.authService.refresh(refreshToken);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get current user' })
    @ApiBearerAuth()
    me(@CurrentUser() user: UserDocument) {
        return user;
    }
}