interface UserCommentResponse {
  id: number;
  parentCommentId: number | null;
  comicId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: CreatorCommentResponse;
  mentionedUser: MentionedUserCommentResponse;
  answers: UserCommentResponse[];
}

interface CreatorCommentResponse {
  id: number;
  fullname: string;
  avatar: string;
}

interface MentionedUserCommentResponse extends CreatorCommentResponse {}
