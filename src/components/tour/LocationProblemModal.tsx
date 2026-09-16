import { AlertModal } from '@/components/common/AlertModal';
import type { LocationProblem } from '@/utils/locationPolicy';
import { useState } from 'react';
import { Linking } from 'react-native';

export function LocationProblemModal({ problem, purpose, onClose }: {
  problem: LocationProblem | null;
  purpose: 'visit' | 'map';
  onClose: () => void;
}) {
  const [settingsFailed, setSettingsFailed] = useState(false);
  const needsSettings = problem === 'blocked' || problem === 'approximate';
  const purposeText = purpose === 'visit' ? '방문 인증을 위해' : '내 위치 표시를 위해';
  const title = settingsFailed ? '설정을 열 수 없어요' : problem === 'approximate'
    ? '정확한 위치 사용' : problem === 'blocked' ? '위치 권한 허용' : '현재 위치를 확인할 수 없어요';
  const description = settingsFailed ? '기기 설정에서 DOTO의 위치 권한을 확인해 주세요.'
    : problem === 'approximate' ? `${purposeText} 정확한 위치를 사용해 주세요.`
    : problem === 'blocked' ? purpose === 'visit' ? '방문 인증을 위해 위치 권한을 허용해 주세요.'
      : '내 위치 표시를 위해 권한을 허용해 주세요.'
    : '기기 위치 서비스를 켠 후 다시 시도해 주세요.';
  const close = () => { setSettingsFailed(false); onClose(); };
  return <AlertModal visible={problem !== null && problem !== 'denied'} title={title}
    description={description} cancelText={needsSettings && !settingsFailed ? '취소' : undefined}
    confirmText={needsSettings && !settingsFailed ? '이동' : '확인'} onClose={close}
    onConfirm={async () => {
      if (!needsSettings || settingsFailed) { close(); return; }
      try { await Linking.openSettings(); close(); } catch { setSettingsFailed(true); }
    }} />;
}
