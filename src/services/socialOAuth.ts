import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import type { SocialProvider } from '@/types/auth';

WebBrowser.maybeCompleteAuthSession();

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

function getGoogleWebClientId() {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new SocialAuthError('Google Web OAuth Client ID 설정이 필요합니다.');
  }

  return clientId;
}

function getGoogleErrorMessage(error: unknown) {
  if (!isErrorWithCode(error)) return 'Google 로그인에 실패했습니다.';

  if (error.code === statusCodes.SIGN_IN_CANCELLED) {
    return 'Google 로그인이 취소되었습니다.';
  }
  if (error.code === statusCodes.IN_PROGRESS) {
    return 'Google 로그인이 이미 진행 중입니다.';
  }
  if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    return 'Google Play 서비스를 사용할 수 없거나 업데이트가 필요합니다.';
  }
  if (error.code === '10' || error.code === 'DEVELOPER_ERROR') {
    return 'Google 로그인 설정을 확인해 주세요. 패키지명, SHA-1 또는 Web Client ID가 일치하지 않습니다.';
  }

  return `Google 로그인에 실패했습니다. (${error.code})`;
}

async function requestGoogleIdToken() {
  if (Platform.OS !== 'android') {
    throw new SocialAuthError('Google 로그인은 현재 Android 앱에서만 지원합니다.');
  }

  try {
    GoogleSignin.configure({
      webClientId: getGoogleWebClientId(),
      scopes: ['email', 'profile'],
      offlineAccess: false,
    });
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) {
      throw new SocialAuthError('Google 로그인이 취소되었습니다.');
    }

    if (!response.data.idToken) {
      throw new SocialAuthError('Google ID Token을 받지 못했습니다.');
    }

    return response.data.idToken;
  } catch (error) {
    if (error instanceof SocialAuthError) throw error;
    throw new SocialAuthError(getGoogleErrorMessage(error));
  }
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
