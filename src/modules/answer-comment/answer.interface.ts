export interface IAnswer {
  id?: number;
  commentId?: number;
  userId?: number;
  mentionedPerson?: string;
  content?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
