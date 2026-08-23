import { MainItemBlock } from '@/components/common/MainItemBlock';
import RegionalHeader from '@/components/festival/region/RegionalHeader';
import SortDropdown from '@/components/festival/region/SortDropdown';
import { EmptyIcon } from '@/components/icons/EmptyIcon';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { FestivalContent } from '@/types/festival';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  subtitle: string;
  title: string;
}

// 임시 데이터 - API 연동시 삭제 예정
const regionalFestivals: FestivalContent[] = [
  {
    id: 1,
    status: 'ongoing',
    imageUrl: 'https://picsum.photos/seed/festival1/400/600',
    title: '김악산 꽃별 여행 김악산 김악산 꽃별 여행 김악산',
    startDate: '2026.9.18',
    endDate: '2026.10.11',
    region: '거창군',
    category: 'EV010100',
  },
  {
    id: 2,
    status: 'ongoing',
    imageUrl: 'https://picsum.photos/seed/festival2/400/600',
    title: '영광불갑산상사화축제',
    startDate: '2026.9.18',
    endDate: '2026.09.27',
    region: '영광군',
    category: 'EV010100',
  },
  {
    id: 3,
    status: 'ended',
    imageUrl: undefined,
    title: '김악산 꽃별 여행 김악산 김악산 꽃별 여행 김악산',
    startDate: '2026.9.18',
    endDate: '2026.10.11',
    region: '거창군',
    category: 'EV010100',
  },
  {
    id: 4,
    status: 'upcoming',
    imageUrl: undefined,
    title: '영광불갑산상사화축제',
    startDate: '2026.9.18',
    endDate: '2026.09.27',
    region: '영광군',
    category: 'EV010100',
  },
];

export const RegionalFestivalPage = ({
  subtitle,
  title,
}: Props) => {
  const insets = useSafeAreaInsets();
  const [sort, setSort] = useState('ENDING_SOON');

  const sortOptions = [
    {
      label: '종료 임박순',
      value: 'ENDING_SOON',
    },
    {
      label: '개최 임박순',
      value: 'STARTING_SOON',
    },
  ];

  const hasRegionalFestivals = regionalFestivals.length > 0;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      <RegionalHeader subtitle={subtitle} title={title} />

      {hasRegionalFestivals ? (
        <>
          <View style={styles.sortSection}>
            <SortDropdown
              value={sort}
              options={sortOptions}
              onChange={setSort}
            />
          </View>
          <FlatList
            data={regionalFestivals}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <MainItemBlock
                type='festival'
                festival={item}
              />
            )}
            ItemSeparatorComponent={() => (
              <View style={{ height: 10 }} />
            )}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyIcon />

          <Text style={styles.emptyText}>
            이 지역에 등록된 축제가 없어요.
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray.gray00,
  },
  sortSection: {
    paddingTop: 34,
    paddingBottom: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    paddingTop: Spacing.one,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    color: Colors.gray.gray60,
  },
});