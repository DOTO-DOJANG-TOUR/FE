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
