import { UserSession } from './user-session.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class UserSessionRepository extends Repository<UserSession> {}
