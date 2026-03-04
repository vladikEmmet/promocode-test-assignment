import {
    IsString, IsNumber, IsOptional, IsBoolean,
    IsDateString, Min, Max, MinLength, MaxLength, IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreatePromocodeDto {
    @ApiProperty({ example: 'WINTER2026' })
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @Transform(({ value }: { value: string }) => value.toUpperCase().trim())
    code!: string;

    @ApiProperty({ example: 10, description: 'Discount percent 1-100' })
    @IsNumber()
    @Min(1)
    @Max(100)
    discount!: number;

    @ApiPropertyOptional({ example: 100, description: 'Total usage limit' })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    usageLimit?: number;

    @ApiPropertyOptional({ example: 1, description: 'Per user usage limit' })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    perUserLimit?: number;

    @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z' })
    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z' })
    @IsOptional()
    @IsDateString()
    dateTo?: string;
}