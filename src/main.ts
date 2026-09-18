import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { PaginatedResponseDTO } from './common/dtos/pagination-reponse.dto';
import { GetOrderDTO } from './orders/dto/orders.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');

  app.enableCors({credentials:true});
  app.use(cookieParser("your-cookie-secret"));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Teslo RESTFul API')
    .setDescription('Teslo shop endpoints')
    .setVersion('1.0')
    .addBearerAuth(
    {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      in: "header",
      name: "Authorization",
      description: "Paste access token without Bearer prefix",
    },
    "Bearer"
  )
  .addSecurityRequirements("Bearer")
    .build();
  const document = SwaggerModule.createDocument(app, config,{extraModels: [PaginatedResponseDTO, GetOrderDTO]});
  SwaggerModule.setup('api', app, document);


  await app.listen(process.env.PORT);
  logger.log(`App running on port ${ process.env.PORT }`);
}
bootstrap();
