import DefaultImage from '@/assets/images/festival/common/card-dim-2.png';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { FestivalContent } from '@/types/festival';
import { TourContent } from '@/types/tour';
import { Image, StyleSheet, Text, View } from 'react-native';
import { FestivalCategoryBadge } from './FestivalCategoryBadge';
import { FestivalStatusBadge } from './FestivalStatusBadge';

type Props =
  | {
    type: 'festival';
    festival: FestivalContent;
  }
  | {
    type: 'tour';
    tour: TourContent;
  };

export const MainItemBlock = (props: Props) => {
  const content =
    props.type === 'festival'
      ? props.festival
      : props.tour;

  const {
    imageUrl,
    title,
    category,
  } = content;

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={
            imageUrl
              ? { uri: imageUrl }
              : DefaultImage
          }
          style={styles.image}
        />
        {props.type === 'festival' && (
          <View style={styles.statusBadge}>
            <FestivalStatusBadge status={props.festival.status} />
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
            {title}
          </Text>
          {props.type === 'festival' ? (
            <>
              <Text style={styles.text}>{props.festival.region}</Text>
              <Text style={styles.text}>{props.festival.startDate} ~ {props.festival.endDate}</Text>
            </>
          ) : (
            <Text style={styles.text}>{props.tour.distance}m · {props.tour.address}</Text>
          )}
        </View>


        {/* 카테고리 code는 api연동 후 수정 */}
        <FestivalCategoryBadge category={category} />
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