import * as winston from 'winston';
import { LoggerInterface } from './logger.interface';
import { ElasticsearchTransport } from 'winston-elasticsearch';

const Logger = winston.createLogger({
  transports: [
    new ElasticsearchTransport({
      level: 'error',
      clientOpts: { node: process.env.ELASTICSEARCH_ENDPOINT },
    }),
  ],
});
