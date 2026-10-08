import { commandDeadlineMiddleware } from './command-budget';
import 'reflect-metadata';
import { Controller, Get, Module, Catch, HttpException, type ExceptionFilter, type ArgumentsHost } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CatalogModule } from './catalog';
import { MemoryCacheModule } from './memory-cache';
import { AdminCatalogModule } from './admin-catalog';
import { NestFactory } from '@nestjs/core';
import type {NestExpressApplication} from '@nestjs/platform-express';
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
    if (response.headersSent || response.writableEnded) return;
    const status=error instanceof HttpException ? error.getStatus() : 500;
    const code=status===400?'INVALID_INPUT':status===401?'AUTHENTICATION_REQUIRED':status===403?'FORBIDDEN':status===404?'NOT_FOUND':status===409?'CONFLICT':status===503?'UNAVAILABLE':'INTERNAL_ERROR';
    response.status(status).json({code,message:code,requestId:randomUUID()});
  }
}
@Module({ controllers: [HealthController], imports:[MemoryCacheModule,CatalogModule,AdminCatalogModule] })
class AppModule {}

export async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule,{bodyParser:false});
  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new SafeErrors());
  app.use((_request:unknown,response:{setHeader:(key:string,value:string)=>void},next:()=>void)=>{
    response.setHeader('Cache-Control','no-store'); response.setHeader('X-Content-Type-Options','nosniff'); next();
  });
  app.use(commandDeadlineMiddleware());
  app.use((request:{method:string;path:string;headers:Record<string,string|undefined>},response:any,next:()=>void)=>{
    if(request.method==='POST' && request.path.toLowerCase().replace(/\/+$/,'')==='/v1/admin/catalog/commands' && request.headers['content-type']?.split(';')[0]?.trim().toLowerCase()!=='application/json') {
      response.status(415).json({code:'UNSUPPORTED_MEDIA_TYPE',message:'UNSUPPORTED_MEDIA_TYPE',requestId:randomUUID()}); return;
    }
    next();
  });
  app.useBodyParser('json',{limit:'12mb'});
  // Handle only known parser failures; never expose parser messages or supplied bodies.
  app.use((error:any,_request:unknown,response:any,next:(error:unknown)=>void)=>{
    if (response.headersSent || response.writableEnded) return;
    const status=error?.type==='entity.too.large'?413:['entity.parse.failed','request.aborted','request.size.invalid'].includes(error?.type)?400:['encoding.unsupported','charset.unsupported'].includes(error?.type)?415:null;
    if(status===null){next(error);return;}
    const code=status===413?'PAYLOAD_TOO_LARGE':status===415?'UNSUPPORTED_MEDIA_TYPE':'INVALID_INPUT';
    response.status(status).json({code,message:code,requestId:randomUUID()});
  });
  app.enableShutdownHooks();
  return app;
}
async function bootstrap(): Promise<void> {
  const port = Number(process.env.PORT ?? '3001');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('INVALID_PORT');
  const app=await createApp();
  // Catalog reads and restricted human Admin commands; commerce remains disabled.
  await app.listen(port, process.env.HOST ?? '127.0.0.1');
}
if(require.main===module) bootstrap().catch(() => { console.error('API_START_FAILED'); process.exitCode = 1; });
