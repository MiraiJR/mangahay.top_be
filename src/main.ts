import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { EnvironmentUtil } from './common/utils/EnvironmentUtil';
import { TransactionDatabase } from './common/database/transaction';
import { TransactionInterceptor } from './common/interceptor/transaction-interceptor';

async function bootstrap() {
  const logger = new Logger('MainApplication');
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: EnvironmentUtil.isDevMode() ? ['http://localhost:3001'] : ['https://mangahay.top'],
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

  const transactionDatabase = app.get(TransactionDatabase);
  app.useGlobalInterceptors(new TransactionInterceptor(transactionDatabase));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, () => {
    logger.log(`Server is listening in port ${PORT}`);
  });
}
bootstrap();
