import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class UserResponseDto {
    @ApiProperty()
    @Expose()
    @Transform(({ obj }) => obj._id?.toString())
    id!: string;

    @ApiProperty()
    @Expose()
    email!: string;

    @ApiProperty()
    @Expose()
    name!: string;

    @ApiProperty()
    @Expose()
    phone!: string;

    @ApiProperty()
    @Expose()
    isActive!: boolean;

    @ApiProperty()
    @Expose()
    createdAt!: Date;
}