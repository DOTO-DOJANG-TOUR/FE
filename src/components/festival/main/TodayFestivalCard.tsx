import DefaultTodayFestivalImage from '@/assets/images/festival/common/card-dim.png';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useEffect, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  imageUrl?: string;
  title: string;
  startDate: string;
  endDate: string;
  region: string;
  onPress?: () => void;
};

export default function TodayFestivalCard({
  imageUrl,
  title,
  startDate,
  endDate,
  region,
  onPress,
}: Props) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const imageSource =
    imageUrl && !imageError
      ? { uri: imageUrl }
      : DefaultTodayFestivalImage;

  return (
    <Pressable onPress={onPress}>
      <ImageBackground
        source={imageSource}
        style={styles.container}
        imageStyle={styles.image}
        resizeMode="cover"
        onError={() => setImageError(true)}
      >
        <View style={[StyleSheet.absoluteFill, styles.overlay]} />
        <View style={styles.content}>
          <Text
            style={styles.title}
            numberOfLines={1}
            ellipsizeMode='tail'
          >{title}</Text>
          <Text
            style={styles.date}
          >{startDate} ~ {endDate}</Text>
          <Text
            style={styles.region}
          >{region}</Text>
        </View>
      </ImageBackground>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 194,
    height: 300,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  image: {
    borderRadius: Radius.md,
  },
  overlay: {
    backgroundColor: 'rgba(38, 38, 38, 0.30)',
    borderRadius: Radius.md,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 14,
  },
  title: {
    color: Colors.gray.gray00,
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
  },
  date: {
    color: Colors.gray.gray00,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  region: {
    paddingTop: Spacing.two,
    color: '#DEDEDE',
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
    lineHeight: 13 * 1.5,
  },
});