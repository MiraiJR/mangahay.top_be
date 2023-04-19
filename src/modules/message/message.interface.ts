export interface IMessage {
  id?: number;
  receiver?: number;
  sender?: number;
  content?: string;
  sentAt?: Date;
  is_read?: boolean;
}
