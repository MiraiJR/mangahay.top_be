interface CreatorComment {
  id: number;
  fullname: string;
  avatar: string;
}

interface MentionedUserComment extends CreatorComment {}

interface UserComment {
  id: number;
  parentCommentId: number | null;
  userId: number;
  comicId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: CreatorComment;
  mentionedUser: MentionedUserComment;
  answers: UserComment[];
}
