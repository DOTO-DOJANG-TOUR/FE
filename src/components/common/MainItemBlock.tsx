import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Image, StyleSheet, Text, View } from 'react-native';
import { FestivalStatusBadge } from './FestivalStatusBadge';

type CardType = 'festival' | 'tour';
type FestivalStatus = 'upcoming' | 'ongoing' | 'ended';

type Props = {
  type: CardType;
  status?: FestivalStatus;
};

export const MainItemBlock = ({ type, status }: Props) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: 'https://picsum.photos/seed/festival/140' }}
          style={styles.image}
        />
        {status && (
          <View style={styles.statusBadge}>
            <FestivalStatusBadge status={status} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.contentTop}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.title}
          >
            김악산 꽃별 여행 김악산 꽃별 여행 김악산 꽃별 여행 김악산 꽃별 여행
          </Text>
          {type === 'festival' ? (
            <>
              <Text style={styles.text}>거창군</Text>
              <Text style={styles.text}>2026.9.18 ~ 2026.10.11</Text>
            </>
          ) : (
            <Text style={styles.text}>179m · 여수시 중앙로 74</Text>
          )}
        </View>

        {/* FestivalCategoryBadge 구현 시 삭제 예정 View */}
        <View
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 4,
            backgroundColor: '#F6F6F6',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: '#A8A8A8',
            }}
          >
            문화관광
          </Text>
        </View>
        
        {/* <FestivalCategoryBadge /> */}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    width: 140,
    height: 140,

  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.md,
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  content: {
    flex: 1,
  },
  contentTop: {
    marginBottom: Spacing.two
  },
  title: {
    color: '#262626',
    fontSize: FontSize.md,
    fontFamily: FontFamily.semiBold,
    lineHeight: FontSize.md * 1.5,
  },
  text: {
    color: '#262626',
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    lineHeight: FontSize.xs * 1.5,
  }
});