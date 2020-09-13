import { Socket } from './socket.handler';
import menash, { ConsumerMessage } from 'menashmq';
export interface Options {
  useRedisAdapter?: boolean;
  redisHost?: string;
  redisPort?: number;
  secret?: string;
  origin?: string;
}
export interface Message {
  rooms?: string[];
  event: string;
  data?: object | string;
}

export const connect = async (rabbitConnectionString: string, socketPort: number, options?: Options) => {
  Socket.start(socketPort, options);
  await menash.connect(rabbitConnectionString);
};

export const listen = async (queueName: string, callback?: (message: any) => Message) => {
  await menash.declareQueue(queueName);

  await menash.queue(queueName).activateConsumer((msg: ConsumerMessage) => {
    const content = msg.getContent();

    const message = callback ? callback(content) : (content) as Message;

    if (message.event) {
      if (message.rooms) {
        Socket.emitRooms(message.rooms, message.event, message.data);
      } else {
        Socket.emitAll(message.event, message.data);
      }
    }

    msg.ack();
  });
};
