import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyPromocodeDto {
    @ApiProperty({ example: 'SUMMER2024' })
    @IsString()
    @MinLength(3)
    code!: string;
}