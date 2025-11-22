export interface UserSource {
  id: string;
  name: string;
  balance: number;
}

export interface PostSource {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

export interface ProfileSource {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
}

export interface MemberTypeSource {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
}
