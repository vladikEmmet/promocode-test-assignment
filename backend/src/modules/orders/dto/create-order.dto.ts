import { IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({ example: 1500.00 })
    @IsNumber()
    @IsPositive()
    @Min(1)
    amount!: number;
}