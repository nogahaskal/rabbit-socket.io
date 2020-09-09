import menash, { ConsumerMessage } from 'menashmq';
import { Socket } from './socket.handler';
import { Message } from './index';

export async function connect(connectionString: string, queue: string): Promise<void> {
  await menash.connect(connectionString);
  await menash.declareQueue(queue);
}

export async function listen(queue: string) {
  await menash.queue(queue).activateConsumer((msg: ConsumerMessage) => {
    const message = msg.getContent() as Message;

    if (message.event) {
      if (message.rooms) {
        Socket.emitRooms(message.rooms, message.event, message.data);
      } else if (message.namespace) {
        Socket.emitNamespace(message.namespace, message.event, message.data);
      } else {
        Socket.emitAll(message.event, message.data);
      }
    }

    msg.ack();
  });
}
