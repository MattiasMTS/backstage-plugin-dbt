import { createServiceBuilder } from '@backstage/backend-common';
import { Server } from 'http';
import { Logger } from 'winston';

// Import the router creation function based on your modularized structure
import { createRouter, RouterOptions } from './router';
import { GoogleStorageProvider } from './googleStorage';

// Create the storage provider instance, default
// uses the Google Cloud Storage provider to maintain
// regression.
const storageProvider = new GoogleStorageProvider();


export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({ service: 'dbt-backend' });
  logger.debug('Starting application server...');

  // Create router options and include the logger
  const routerOptions: RouterOptions = {
    logger,
    storageProvider,
  };

  // Create the router using the modularized router creation function
  const router = createRouter(routerOptions);

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/dbt', router);

  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
