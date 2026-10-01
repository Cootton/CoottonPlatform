import 'reflect-metadata';
import { Controller, Get, Module, Catch, HttpException, type ExceptionFilter, type ArgumentsHost } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CatalogModule } from './catalog';
import { NestFactory } from '@nestjs/core';
import { CONTRACT_VERSION, type Liveness } from '@cootton/contracts';

@Controller('health')
class HealthController {
  @Get('live')
  live(): Liveness { return { status: 'alive', contractVersion: CONTRACT_VERSION }; }
}
@Catch()
class SafeErrors implements ExceptionFilter {
  catch(error: unknown, host:ArgumentsHost):void {
    const response=host.switchToHttp().getResponse();
    const status=error instanceof HttpException ? error.getStatus() : 500;
    const code=status===400?'INVALID_INPUT':status===404?'NOT_FOUND':status===503?'UNAVAILABLE':'INTERNAL_ERROR';
    response.status(status).json({code,message:code,requestId:randomUUID()});
  }
}
@Module({ controllers: [HealthController], imports:[CatalogModule] })
class AppModule {}

async function bootstrap(): Promise<void> {
  const port = Number(process.env.PORT ?? '3001');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('INVALID_PORT');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new SafeErrors());
  app.use((_request:unknown,response:{setHeader:(key:string,value:string)=>void},next:()=>void)=>{
    response.setHeader('Cache-Control','no-store'); response.setHeader('X-Content-Type-Options','nosniff'); next();
  });
  app.enableShutdownHooks();
  // Read-only public catalog; no authenticated mutations or payment adapter.
  await app.listen(port, process.env.HOST ?? '127.0.0.1');
}
bootstrap().catch(() => { console.error('API_START_FAILED'); process.exitCode = 1; });
