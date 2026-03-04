import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';
import { PromocodesService } from '../modules/promocodes/promocodes.service';
import { OrdersService } from '../modules/orders/orders.service';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const usersService = app.get(UsersService);
    const promocodesService = app.get(PromocodesService);
    const ordersService = app.get(OrdersService);

    console.log('Seeding...');

    const user1 = await usersService.create({
        email: 'alice@test.com',
        name: 'Alice Johnson',
        phone: '+79991111111',
        password: 'password123',
    }).catch(() => null);

    const user2 = await usersService.create({
        email: 'bob@test.com',
        name: 'Bob Smith',
        phone: '+79992222222',
        password: 'password123',
    }).catch(() => null);

    console.log('Users created');

    await promocodesService.create({
        code: 'WELCOME10',
        discount: 10,
        usageLimit: 100,
        perUserLimit: 1,
        dateTo: '2027-12-31T23:59:59Z',
    }).catch(() => null);

    await promocodesService.create({
        code: 'SAVE20',
        discount: 20,
        usageLimit: 50,
        perUserLimit: 2,
        dateTo: '2027-06-30T23:59:59Z',
    }).catch(() => null);

    await promocodesService.create({
        code: 'VIP50',
        discount: 50,
        usageLimit: 10,
        perUserLimit: 1,
    }).catch(() => null);

    console.log('Promocodes created');

    if (user1) {
        const order1 = await ordersService.create({ amount: 1500 }, user1);
        await ordersService.applyPromocode(
            order1._id.toString(),
            { code: 'WELCOME10' },
            user1,
        ).catch(() => null);

        await ordersService.create({ amount: 3000 }, user1);
    }

    if (user2) {
        const order2 = await ordersService.create({ amount: 2500 }, user2);
        await ordersService.applyPromocode(
            order2._id.toString(),
            { code: 'SAVE20' },
            user2,
        ).catch(() => null);
    }

    console.log('Orders created');
    console.log('Seed complete!');
    console.log('');
    console.log('Test credentials:');
    console.log('  alice@test.com / password123');
    console.log('  bob@test.com   / password123');

    await app.close();
}

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});