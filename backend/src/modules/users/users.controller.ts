import {
    Controller, Get, Post, Patch, Delete,
    Param, Body, UseGuards, BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {CurrentUser} from "../../common/decorators/current-user.decorator";
import type {UserDocument} from "./user.schema";

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.update(id, dto);
    }

    @Delete(':id')
    deactivate(@Param('id') id: string, @CurrentUser() currentUser: UserDocument) {
        if (currentUser._id.toString() === id) {
            throw new BadRequestException('Cannot deactivate yourself');
        }
        return this.usersService.deactivate(id);
    }
}