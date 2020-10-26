import { Socket } from './socket.handler';
import menash, { ConsumerMessage } from 'menashmq';

import { Options } from './options.interface';

/**
 * Message is the expected type of the message from rabbit
 */
export interface Message {
  rooms?: string[];
  event: string;
  data?: object | string;
}

/**
 * connect the socket and rabbit
 * @param rabbitConnectionString the connection string to rabbit server
 * @param socketPort the socket connection port
 * @param options
 */
export const connect = async (rabbitConnectionString: string, socketPort: number, options?: Options) => {
  Socket.start(socketPort, options);
  await menash.connect(rabbitConnectionString);
};

/**
 * listen to the queue.
 * @param queueName the name of the queue
 * @param callback the callback function to formmat the message contant from rabbit
 */
export const listen = async (queueName: string, callback?: (message: any) => Message) => {
  await menash.declareQueue(queueName);

  await menash.queue(queueName).activateConsumer((msg: ConsumerMessage) => {
    const content = msg.getContent();

    const message = callback ? callback(content) : (content) as Message;

    if (!message.event) throw new Error('message must contain an event');

    message.rooms ? Socket.emitRooms(message.rooms, message.event, message.data) : Socket.emitAll(message.event, message.data);

    msg.ack();
  });
};
