import { PartialType } from '@nestjs/swagger';
import { CreatePromocodeDto } from './create-promocode.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePromocodeDto extends PartialType(CreatePromocodeDto) {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}