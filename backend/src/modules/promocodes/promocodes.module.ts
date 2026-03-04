import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Promocode, PromocodeSchema } from './promocode.schema';
import { PromocodesService } from './promocodes.service';
import { PromocodesController } from './promocodes.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Promocode.name, schema: PromocodeSchema },
        ]),
    ],
    controllers: [PromocodesController],
    providers: [PromocodesService],
    exports: [PromocodesService],
})
export class PromocodesModule {}