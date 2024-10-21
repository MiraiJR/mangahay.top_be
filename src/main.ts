import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { TransactionInterceptor } from './common/interceptor/transaction.interceptor';
import { ApplicationExceptionFilter } from '@common/exception/application.exception.filter';
import { UnknownExceptionFilter } from '@common/exception/unknown.exception.filter';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const logger = new Logger('MainApplication');
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new ApplicationExceptionFilter());
  // app.useGlobalFilters(new UnknownExceptionFilter());

  const dataSource = app.get(DataSource);
  app.useGlobalInterceptors(new TransactionInterceptor(dataSource));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, () => {
    logger.log(`Server is listening in port ${PORT}`);
  });
}
bootstrap();
