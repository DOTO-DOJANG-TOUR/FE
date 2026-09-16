import { Colors, Radius } from '@/constants/theme';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { TourAsset } from './TourAsset';

export function TourImage({ uri, style }: { uri?: string | null; style: StyleProp<ViewStyle> }) {
  const normalizedUri = uri?.trim() || null;
  // URI별 인스턴스를 사용해 이전 요청의 늦은 오류가 새 이미지의 상태를 덮지 않게 한다.
  return <ImageContent key={normalizedUri} uri={normalizedUri} style={style} />;
}

function ImageContent({ uri, style }: { uri: string | null; style: StyleProp<ViewStyle> }) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={[styles.frame, style]}>
      {!uri || failed ? (
        <TourAsset name="noImage" />
      ) : (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover"
          onError={() => setFailed(true)} accessibilityLabel="관광지 사진" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: Radius.md, overflow: 'hidden', backgroundColor: Colors.gray.gray10,
    alignItems: 'center', justifyContent: 'center',
  },
});
