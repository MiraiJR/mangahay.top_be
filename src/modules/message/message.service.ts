import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { Repository } from 'typeorm';
import { IMessage } from './message.interface';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async create(message: IMessage) {
    return await this.messageRepository.save({
      ...message,
    });
  }

  async recallMessage(id_message: number) {
    return await this.messageRepository.save({
      id: id_message,
      content: 'Tin nhắn đã được thu hồi!',
    });
  }

  async getMessagesSenderReceiver(sender: number, receiver: number) {
    return await this.messageRepository.find({
      where: {
        sender: sender,
        receiver: receiver,
      },
      order: {
        sentAt: 'ASC',
      },
    });
  }

  async getSpecificConservation(id_user: number, object: number) {
    return await this.messageRepository.manager.query(
      `select * from message
      where (sender = ${id_user} and receiver = ${object}) or (sender =  ${object} and receiver = ${id_user})
      order by ("sentAt") ASC`,
    );
  }

  async getConservation(id_user: number) {
    return await this.messageRepository.manager.query(
      `SELECT 
        user_join.id as id_user,
        user_join.fullname as fullname, 
        user_join.avatar as avatar
      FROM ((
      SELECT 
        sender as user 
      FROM 
        message 
      where sender = ${id_user} or receiver = ${id_user} 
      group by (sender)
      union
      SELECT 
        receiver as user 
      FROM 
        message
      where sender = ${id_user} or receiver = ${id_user}
      group by (receiver)
      )
      except
      SELECT 
        sender as user 
      FROM 
        message
      where sender = ${id_user}
      group by (sender)) as user_chat 
      left join 
        public.user as user_join on user_chat.user = user_join.id
      
      `,
    );
  }
}
