import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { login as loginWithKakao } from '@react-native-seoul/kakao-login';
import { Platform } from 'react-native';

import type { SocialProvider } from '@/types/auth';

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

function getKakaoNativeAppKey() {
  const nativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;
  if (!nativeAppKey) {
    throw new SocialAuthError('Kakao Native App Key 설정이 필요합니다.');
  }

  return nativeAppKey;
}

async function requestGoogleIdToken() {
  if (Platform.OS !== 'android') {
    throw new SocialAuthError('Google 로그인은 현재 Android 앱에서만 지원합니다.');
  }

  try {
    const webClientId = getGoogleWebClientId();

    GoogleSignin.configure({
      webClientId,
      scopes: ['openid', 'email', 'profile'],
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
  if (Platform.OS !== 'android') {
    throw new SocialAuthError('Kakao 로그인은 현재 Android 앱에서만 지원합니다.');
  }

  getKakaoNativeAppKey();

  try {
    const token = await loginWithKakao();
    if (!token.idToken) {
      throw new SocialAuthError('Kakao ID Token을 받지 못했습니다. Kakao OIDC 설정을 확인해 주세요.');
    }

    return token.idToken;
  } catch (error) {
    if (error instanceof SocialAuthError) throw error;
    throw new SocialAuthError(
      error instanceof Error && error.message
        ? `Kakao 로그인에 실패했습니다. (${error.message})`
        : 'Kakao 로그인에 실패했습니다.',
    );
  }
}

export function requestSocialIdToken(provider: SocialProvider) {
  return provider === 'GOOGLE' ? requestGoogleIdToken() : requestKakaoIdToken();
}
