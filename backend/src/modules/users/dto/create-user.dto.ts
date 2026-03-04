import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name!: string;

    @ApiProperty({ example: '+79991234567' })
    @IsString()
    @Matches(/^\+?[\d\s\-()\d]{7,20}$/, { message: 'Invalid phone format' })
    phone!: string;

    @ApiProperty({ example: 'strongPassword123', minLength: 8 })
    @IsString()
    @MinLength(8)
    password!: string;
}