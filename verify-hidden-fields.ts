import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Beach } from './src/beaches/beach.entity';

async function verify() {
    const app = await NestFactory.create(AppModule);
    // We need to manually apply the interceptor logic or simulate a request, 
    // but ClassSerializerInterceptor works on the response object in the HTTP layer.
    // However, we can also test the serialization directly using class-transformer if we want,
    // OR we can simulate the interceptor behavior.

    // Actually, the easiest way to verify if the interceptor is working is to use class-transformer directly
    // because the interceptor just calls classToPlain.
    // But to be sure the interceptor is wired up, we might want an e2e test, but that's heavier.
    // Let's stick to verifying that the entity is decorated correctly and classToPlain works as expected.

    const { instanceToPlain } = require('class-transformer');

    const beach = new Beach();
    beach.id = 1;
    beach.name = 'Test Beach';
    // @ts-ignore
    beach.createdAt = new Date();
    // @ts-ignore
    beach.updatedAt = new Date();
    // @ts-ignore
    beach.deletedAt = new Date();

    const plain = instanceToPlain(beach);
    console.log('Serialized Beach:', plain);

    if (plain.createdAt === undefined && plain.updatedAt === undefined && plain.deletedAt === undefined) {
        console.log('VERIFICATION PASSED: Timestamp fields are hidden');
    } else {
        console.log('VERIFICATION FAILED: Timestamp fields are visible');
        console.log('createdAt:', plain.createdAt);
        console.log('updatedAt:', plain.updatedAt);
        console.log('deletedAt:', plain.deletedAt);
    }

    await app.close();
}

verify();
