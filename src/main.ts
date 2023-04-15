import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { HttpStatus, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    optionsSuccessStatus: HttpStatus.OK,
  });
  app.useGlobalPipes(new ValidationPipe());
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, () => {
    console.log(`Server is listening in port ${PORT}`);
  });
}
bootstrap();
