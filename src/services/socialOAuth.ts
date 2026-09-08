import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import type { SocialProvider } from '@/types/auth';

WebBrowser.maybeCompleteAuthSession();

const googleDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
};

const kakaoDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://kauth.kakao.com/oauth/authorize',
  tokenEndpoint: 'https://kauth.kakao.com/oauth/token',
  userInfoEndpoint: 'https://kapi.kakao.com/v1/oidc/userinfo',
};

export class SocialAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SocialAuthError';
  }
}

function getGoogleClientId() {
  const clientId = Platform.select({
    android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    default: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

  if (!clientId) {
    const platform = Platform.OS === 'android' ? 'Android' : Platform.OS === 'ios' ? 'iOS' : 'Web';
    throw new SocialAuthError(`Google ${platform} OAuth Client ID 설정이 필요합니다.`);
  }

  return clientId;
}

function getGoogleRedirectUri(clientId: string) {
  if (Platform.OS === 'android') return 'com.dotofe:/oauthredirect';

  if (Platform.OS === 'ios') {
    const identifier = clientId.replace('.apps.googleusercontent.com', '');
    return `com.googleusercontent.apps.${identifier}:/oauthredirect`;
  }

  return AuthSession.makeRedirectUri({ path: 'oauth/google' });
}

async function requestGoogleIdToken() {
  const clientId = getGoogleClientId();
  const redirectUri = getGoogleRedirectUri(clientId);
  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    scopes: ['openid', 'profile', 'email'],
    usePKCE: true,
    prompt: AuthSession.Prompt.SelectAccount,
  });

  await request.makeAuthUrlAsync(googleDiscovery);
  const result = await request.promptAsync(googleDiscovery);
  if (result.type !== 'success') {
    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new SocialAuthError('Google 로그인이 취소되었습니다.');
    }
    throw new SocialAuthError('Google 로그인에 실패했습니다.');
  }

  const token = await AuthSession.exchangeCodeAsync(
    {
      clientId,
      code: result.params.code,
      redirectUri,
      extraParams: { code_verifier: request.codeVerifier ?? '' },
    },
    googleDiscovery,
  );

  if (!token.idToken) throw new SocialAuthError('Google ID Token을 받지 못했습니다.');
  return token.idToken;
}

async function requestKakaoIdToken() {
  const clientId = process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID;
  if (!clientId) throw new SocialAuthError('Kakao REST API 키 설정이 필요합니다.');

  const redirectUri = getKakaoRedirectUri();
  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    scopes: ['openid', 'profile_nickname', 'account_email'],
    usePKCE: true,
  });

  await request.makeAuthUrlAsync(kakaoDiscovery);
  const result = await request.promptAsync(kakaoDiscovery);
  if (result.type !== 'success') {
    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new SocialAuthError('Kakao 로그인이 취소되었습니다.');
    }
    throw new SocialAuthError('Kakao 로그인에 실패했습니다.');
  }

  const token = await AuthSession.exchangeCodeAsync(
    {
      clientId,
      code: result.params.code,
      redirectUri,
      extraParams: { code_verifier: request.codeVerifier ?? '' },
    },
    kakaoDiscovery,
  );

  if (!token.idToken) throw new SocialAuthError('Kakao ID Token을 받지 못했습니다.');
  return token.idToken;
}

export function requestSocialIdToken(provider: SocialProvider) {
  return provider === 'GOOGLE' ? requestGoogleIdToken() : requestKakaoIdToken();
}

export function getKakaoRedirectUri() {
  const redirectUri = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI;
  if (!redirectUri) {
    throw new SocialAuthError('Kakao HTTPS OAuth 콜백 URI 설정이 필요합니다.');
  }

  return redirectUri;
}
