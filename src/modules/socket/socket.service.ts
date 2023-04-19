import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { Cache } from 'cache-manager';
import { IMessage } from '../message/message.interface';

@Injectable()
export class SocketService {
  constructor(
    private logger: Logger = new Logger(SocketService.name),
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private redisCache: Cache,
  ) {}
  public socket: Server = null;

  getSocket(): Server {
    return this.socket;
  }

  sendMessage(idClient: string, data: any) {
    this.socket.to(idClient).emit('haha', data);
  }

  async addClientToList(socket: Socket): Promise<void> {
    const id_user = await this.extractId(socket);

    await this.redisCache.set(`USER:${id_user}:SOCKET`, socket.id, {
      ttl: 1000 * 60 * 60 * 24 * 1000,
    });
  }

  async removeClientFromList(socket: Socket): Promise<void> {
    const id_user = await this.extractId(socket);

    this.redisCache.del(`USER:${id_user}:SOCKET`);
  }

  async checkUserOnline(id_user: number): Promise<any> {
    const id_socket = await this.redisCache.get(`USER:${id_user}:SOCKET`);
    return id_socket ? id_socket : null;
  }

  async extractId(socket: Socket): Promise<number> {
    try {
      const token = socket.handshake.headers.authorization;

      return await this.jwtService.verify(token, {
        secret: process.env.ACCESSTOKEN_KEY,
      }).idUser;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async forwardMessageToReceiverRT(message: IMessage) {
    const receiver_socket = await this.checkUserOnline(message.receiver);

    if (receiver_socket) {
      this.socket.to(receiver_socket).emit('forward_message', message);
    }
  }
}
