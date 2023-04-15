import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';

@WebSocketGateway({ cors: '*:*' })
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private socketService: SocketService) {}

  @WebSocketServer() public server: Server;
  private logger: Logger = new Logger('SocketGateway');

  afterInit(server: Server) {
    this.socketService.socket = server;
  }

  handleDisconnect(client: Socket) {
    // client disconnected
    this.logger.log(`Client disconnected: ${client.id}`);
    this.socketService.removeClientFromList(client);
  }

  handleConnection(client: Socket) {
    // client connected
    this.logger.log(`Client connected: ${client.id}`);
    this.socketService.addClientToList(client);
  }

  @SubscribeMessage('receive_message')
  getMsgFromClient(
    @MessageBody() content: string,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(content);
    this.socketService.sendMessage(socket.id, {
      title: 'Truyện ABC vừa được cập nhật chapter 56. Nhấn để xem ngay',
      createdAt: new Date(),
    });
  }
}
