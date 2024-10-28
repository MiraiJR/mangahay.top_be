interface UserCommentResponse {
  id: number;
  parentCommentId: number | null;
  comicId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: CreatorCommentResponse;
  mentionedUser: MentionedUserCommentResponse;
  theNumberOfAnswer: number;
}

interface CreatorCommentResponse {
  id: number;
  fullname: string;
  avatar: string;
}

interface MentionedUserCommentResponse extends CreatorCommentResponse {}
