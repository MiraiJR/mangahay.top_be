import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { Cache } from 'cache-manager';

@Injectable()
export class SocketService {
  constructor(
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

  async addClientToList(socket: Socket) {
    const token = socket.handshake.headers.authorization;

    const id_user = this.jwtService.verify(token, {
      secret: process.env.ACCESSTOKEN_KEY,
    }).idUser;

    this.redisCache.set(`USER:${id_user}:SOCKET`, socket.id, {
      ttl: 1000 * 60 * 60 * 24 * 1000,
    });
  }

  async removeClientFromList(socket: Socket) {
    const token = socket.handshake.headers.authorization;

    const id_user = this.jwtService.verify(token, {
      secret: process.env.ACCESSTOKEN_KEY,
    }).idUser;

    this.redisCache.del(`USER:${id_user}:SOCKET`);
  }

  async checkUserOnline(id_user: number): Promise<any> {
    const id_socket = await this.redisCache.get(`USER:${id_user}:SOCKET`);
    return id_socket ? id_socket : null;
  }
}
