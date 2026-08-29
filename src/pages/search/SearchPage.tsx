import { MainItemBlock } from '@/components/common/MainItemBlock';
import { DeleteIcon } from '@/components/icons/DeleteIcon';
import { EmptyIcon } from '@/components/icons/EmptyIcon';
import SearchHeader from '@/components/search/SearchHeader';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useRecentSearchStore } from '@/stores/recentSearchStore';
import { FestivalContent } from '@/types/festival';
import { TourContent } from '@/types/tour';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  type: 'festival' | 'tour';
};

export default function SearchPage({ type }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [keyword, setKeyword] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [festivalResults, setFestivalResults] =
    useState<FestivalContent[]>([]);

  const [tourResults, setTourResults] =
    useState<TourContent[]>([]);

  const recentSearches = useRecentSearchStore(
    (state) => state.recentSearches[type]
  );

  const addRecentSearch = useRecentSearchStore(
    (state) => state.addRecentSearch
  );

  const removeRecentSearch = useRecentSearchStore(
    (state) => state.removeRecentSearch
  );

  const handleDeleteRecentSearch = (keyword: string) => {
    removeRecentSearch(type, keyword);
  };

  const handleSearch = async () => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) return;

    addRecentSearch(type, trimmedKeyword);

    setHasSearched(true);

    if (type === 'festival') {
      // 축제 검색 API 호출 예정
      return;
    }

    // 관광지 검색 API 호출 예정
  };

  return (
    <View style={[
      styles.container, {
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }
    ]}>
      <SearchHeader
        type={type}
        keyword={keyword}
        onChangeKeyword={setKeyword}
        onSearch={handleSearch}
      />
      {hasSearched ? (
        type === 'festival' ? (
          festivalResults.length > 0 ? (
            <FlatList
              data={festivalResults}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.resultList}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => (
                <View style={styles.separator} />
              )}
              renderItem={({ item }) => (
                <MainItemBlock
                  type="festival"
                  festival={item}
                  onPress={() =>
                    router.push({
                      pathname: '/festival-detail/[id]',
                      params: {
                        id: String(item.id),
                      },
                    })
                  }
                />
              )}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <EmptyIcon />

              <Text style={styles.emptyText}>
                검색 결과가 없어요.
              </Text>
            </View>
          )
        ) : (
          tourResults.length > 0 ? (
            <FlatList
              data={tourResults}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.resultList}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => (
                <View style={styles.separator} />
              )}
              renderItem={({ item }) => (
                <MainItemBlock
                  type="tour"
                  tour={item}
                  onPress={() => {
                    // tour route 생성 후 연결 예정
                  }}
                />
              )}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <EmptyIcon />

              <Text style={styles.emptyText}>
                검색 결과가 없어요.
              </Text>
            </View>
          )
        )
      ) : recentSearches.length > 0 ? (
        <View style={styles.recentSearchBox}>
          <Text style={styles.title}>최근 검색어</Text>
          <FlatList
            data={recentSearches}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.recentSearchList}
            renderItem={({ item }) => (
              <View style={styles.recentSearchItem}>
                <Text
                  style={styles.recentSearchText}
                  numberOfLines={1}
                  ellipsizeMode='tail'
                >
                  {item}
                </Text>

                <Pressable
                  onPress={() => handleDeleteRecentSearch(item)}
                  style={styles.deleteButton}
                >
                  <DeleteIcon />
                </Pressable>
              </View>
            )}
          />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyIcon />

          <Text style={styles.emptyText}>
            최근 검색어가 없어요.
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
  recentSearchBox: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 18,
    lineHeight: 18 * 1.5,
    color: Colors.gray.gray100,
  },
  recentSearchList: {
    paddingVertical: 16,
    gap: 14,
  },
  recentSearchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
  },
  recentSearchText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
    color: Colors.gray.gray100,
  },
  deleteButton: {
    width: 22,
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
  resultList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  separator: {
    height: 10,
  },
});