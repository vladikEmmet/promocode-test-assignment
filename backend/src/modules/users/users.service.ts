import {
    Injectable, NotFoundException,
    ConflictException, Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CLICKHOUSE_CLIENT } from '../../database/clickhouse/clickhouse.module';
import { ClickHouseClient } from '@clickhouse/client';
import {toClickHouseDateTime} from "../../common/helpers/clickhouse-date.helper";
import {withRetry} from "../../common/helpers/retry.helper";
import {SyncService} from "../../common/services/sync.service";

@Injectable()
export class UsersService extends SyncService {
    protected cachePatterns = ['analytics:users:*'];

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) {
        super();
    }

    async create(dto: CreateUserDto): Promise<UserDocument> {
        const exists = await this.userModel.findOne({ email: dto.email });
        if (exists) throw new ConflictException('Email already registered');

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user = await this.userModel.create({
            email: dto.email,
            name: dto.name,
            phone: dto.phone,
            passwordHash,
        });

        await this.syncToClickHouse(user);

        return user;
    }

    async findAll(): Promise<UserDocument[]> {
        return this.userModel.find({ isActive: true });
    }

    async findById(id: string): Promise<UserDocument> {
        const user = await this.userModel.findById(id);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
        return this.userModel
            .findOne({ email })
            .select('+passwordHash')
            .exec() as Promise<UserDocument | null>;
    }

    async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
        const user = await this.userModel.findByIdAndUpdate(id, dto, { new: true });
        if (!user) throw new NotFoundException('User not found');

        await this.syncToClickHouse(user);

        return user;
    }

    async deactivate(id: string): Promise<UserDocument> {
        const user = await this.userModel.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true },
        );
        if (!user) throw new NotFoundException('User not found');

        await this.syncToClickHouse(user);

        return user;
    }

    private async syncToClickHouse(user: UserDocument): Promise<void> {
        await this.syncAndInvalidate(
            [{
                id:         user._id.toString(),
                email:      user.email,
                name:       user.name,
                phone:      user.phone,
                is_active:  user.isActive ? 1 : 0,
                created_at: toClickHouseDateTime(user.createdAt),
                updated_at: toClickHouseDateTime(user.updatedAt),
            }],
            'users',
            `sync user ${user._id.toString()}`,
        );
    }
}