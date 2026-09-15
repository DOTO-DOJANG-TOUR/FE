export type SocialProvider = 'GOOGLE' | 'KAKAO';

export type AuthUser = {
  userId: string;
  nickname: string;
};

export type AuthSession = AuthUser & {
  accessToken: string;
  refreshToken: string;
};

export type ApiEnvelope<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

export type MemberStatus = 'ACTIVE' | 'INACTIVE';

// profile_img만 백엔드 응답에서 유일하게 snake_case다.
export type Member = {
  userId: string;
  email: string;
  nickname: string;
  status: MemberStatus;
  provider: SocialProvider;
  profile_img: string | null;
};
