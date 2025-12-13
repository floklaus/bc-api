import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Configure CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Beach API')
    .setDescription('The Beach API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app as any, config);
  SwaggerModule.setup('api', app as any, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
