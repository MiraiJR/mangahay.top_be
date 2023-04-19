import { Logger, UseGuards } from '@nestjs/common';
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
import { MessageService } from '../message/message.service';
import { IMessage } from '../message/message.interface';
import { INotification } from '../notification/notification.interface';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';

@WebSocketGateway({ cors: '*:*' })
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private socketService: SocketService,
    private messageService: MessageService,
    private userService: UserService,
    private notifyService: NotificationService,
  ) {}

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

  @UseGuards()
  @SubscribeMessage('receive_coming_message')
  async getAndForwardMessage(
    @MessageBody() content: any,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const sender: number = await this.socketService.extractId(socket);
      const new_message: IMessage = {
        ...content,
        receiver: parseInt(content.receiver),
        sender: sender,
      };

      const receiver: User = await this.userService.getUserById(
        parseInt(content.receiver),
      );

      const new_notify: INotification = {
        id_user: parseInt(content.receiver),
        title: 'Tin nhắn mới!',
        body: `Người dùng: "<strong>${receiver.fullname}</strong>" đã gửi tin nhắn mới đến cho bạn!`,
        thumb:
          'https://img.freepik.com/free-vector/newsletter-subscription-modern-pastime-online-news-reading-internet-mail-spam-advertisement-phishing-letter-scam-idea-design-element_335657-1616.jpg?w=826&t=st=1681874572~exp=1681875172~hmac=e5df31df9a5427192274ca238c7e00c48889586006e56e80a495729562e86707',
      };

      await this.messageService.create(new_message).then((data) => {
        this.socketService.forwardMessageToReceiverRT(data);
      });

      this.notifyService.create(new_notify).then((data) => {
        this.notifyService.notifyToUser(data);
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
