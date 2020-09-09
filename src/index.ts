import { Socket } from './socket.handler';
import * as Rabbit from './rabbit.handler';

export interface Options {
  useRedisAdapter?: boolean;
  namespaces?: string[];
  redisHost?: string;
  redisPort?: number;
  secret?: string;
  origin?: string;
}

export interface Message {
  rooms?: string[];
  namespace?: string;
  event: string;
  data?: object | string;
}

export async function connect(rabbitConnectionString: string, queueName: string, options?: Options) {
  Socket.start(options);
  await Rabbit.connect(rabbitConnectionString, queueName);
}

export async function listen(queueName: string) {
  await Rabbit.listen(queueName);
}

(async () => {
  await connect('amqp://localhost', 'socket');
  listen('socket');
})();
