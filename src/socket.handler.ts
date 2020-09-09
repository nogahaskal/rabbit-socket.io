import * as express from 'express';
import * as socketIO from 'socket.io';
import * as socketIORedis from 'socket.io-redis';
import * as jwt from 'jsonwebtoken';
import * as http from 'http';
import { Options } from './index';

export class Socket {
  static io: socketIO.Server;
  private app: express.Application;
  private server: http.Server;
  private options: Options;

  public static start(options?: Options): Socket {
    return new Socket(options);
  }

  private constructor(options?: Options) {
    this.options = options || {};
    this.app = express();
    this.server = http.createServer(this.app);
    Socket.io = socketIO(this.server);

    this.initalizeSocket();
  }

  private initalizeSocket(): void {
    if (this.options.useRedisAdapter) this.initalizeRedisAdapter(this.options?.redisHost, this.options?.redisPort);
    if (this.options.secret) this.authenitcate(this.options?.secret);
    if (this.options.origin) this.allowOrigin(this.options.origin);
    if (this.options.namespaces) {
      this.options.namespaces.forEach((nsp: string) => {
        this.connectNamespace(nsp);
      });
    }

    this.connect();
  }

  private initalizeRedisAdapter(redisHost: string | undefined, redisPort: number | undefined) {
    Socket.io.adapter(socketIORedis({ host: redisHost || 'localhost', port: redisPort || 6379 }));
  }

  private authenitcate(secret: string) {
    Socket.io.use((socket, next) => {
      const token: string = socket.handshake.query.token;
      if (token) {
        jwt.verify(token, secret, (err) => {
          if (err) return next(new Error('unauthorized'));
          next();
        });
      } else {
        next(new Error('unauthorized'));
      }
    });
  }

  private allowOrigin(origin: string) {
    Socket.io.origins(origin);
  }

  private connect(): void {
    Socket.io.on('connect', (socket: SocketIO.Socket) => {
      socket.on('joinRoom', (room: string) => {
        socket.join(room);
      });
    });
  }

  private connectNamespace(nsp: string): void {
    Socket.io.of(nsp).on('connect', (socket: SocketIO.Socket) => {
      socket.on('joinRoom', (room: string) => {
        socket.join(room);
      });
    });
  }

  static emitRooms(rooms: string[], event: string, data: object | string | undefined): void {
    rooms.forEach((room: string) => {
      Socket.io.to(room).emit(event, data);
    });
  }

  static emitNamespace(namespace: string, event: string, data: object | string | undefined) {
    Socket.io.of(namespace).emit(event, data);
  }

  static emitAll(event: string, data: object | string | undefined) {
    console.log(Socket.io.emit(event, data));
    Socket.io.emit(event, data);
  }
}
