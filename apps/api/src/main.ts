import 'reflect-metadata';
import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CONTRACT_VERSION, type Liveness } from '@cootton/contracts';

@Controller('health')
class HealthController {
  @Get('live')
  live(): Liveness { return { status: 'alive', contractVersion: CONTRACT_VERSION }; }
}
@Module({ controllers: [HealthController] })
class AppModule {}

async function bootstrap(): Promise<void> {
  const port = Number(process.env.PORT ?? '3001');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('INVALID_PORT');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  app.enableShutdownHooks();
  // No business routes, authentication bypass, database or payment adapter.
  await app.listen(port, process.env.HOST ?? '127.0.0.1');
}
bootstrap().catch(() => { console.error('API_START_FAILED'); process.exitCode = 1; });
