import { PageLoadingIndicator } from '@/components/common/PageLoadingIndicator';
import { ApiError, isRetryableError, NetworkOfflineError } from '@/apis/client';
import { getRegionalFestivals } from '@/apis/festival';
import { AlertModal } from '@/components/common/AlertModal';
import { ErrorModal } from '@/components/common/ErrorModal';
import { MainItemBlock } from '@/components/common/MainItemBlock';
import RegionalHeader from '@/components/festival/region/RegionalHeader';
import SortDropdown from '@/components/festival/region/SortDropdown';
import { EmptyIcon } from '@/components/icons/EmptyIcon';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { FestivalContent } from '@/types/festival';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  subtitle: string;
  title: string;
  regionGroup: string;
}

export const RegionalFestivalPage = ({
  subtitle,
  title,
  regionGroup,
}: Props) => {
  const insets = useSafeAreaInsets();
  const [sort, setSort] = useState('END_DATE');
  const router = useRouter();

  const [regionalFestivals, setRegionalFestivals] =
    useState<FestivalContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextCursor, setNextCursor] =
    useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] =
    useState(false);

  const [failedRequest, setFailedRequest] = useState<{
    retry: () => void;
    isOffline: boolean;
  } | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [infoError, setInfoError] = useState<string | null>(null);

  const sortOptions = [
    {
      label: '종료 임박순',
      value: 'END_DATE',
    },
    {
      label: '개최 임박순',
      value: 'START_DATE',
    },
  ];

  const retryFailedRequest = () => {
    const request = failedRequest;
    setFailedRequest(null);
    request?.retry();
  };

  useEffect(() => {
    let isMounted = true;

    const fetchRegionalFestivals = async () => {
      try {
        setIsLoading(true);

        setRegionalFestivals([]);
        setNextCursor(null);

        const result = await getRegionalFestivals(
          regionGroup,
          sort,
        );

        if (!isMounted) {
          return;
        }

        setRegionalFestivals(result.festivals);
        setNextCursor(result.nextCursor ?? null);
      } catch (error) {
        console.error('지역별 축제 조회 실패:', error);
        
        if (!isMounted) {
          return;
        }

        if (isRetryableError(error)) {
          setFailedRequest({
            retry: () => setReloadTrigger((prev) => prev + 1),
            isOffline: error instanceof NetworkOfflineError,
          });
        } else {
          setInfoError(
            error instanceof ApiError
              ? error.message
              : '정보를 불러오지 못했어요.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRegionalFestivals();

    return () => {
      isMounted = false;
    };
  }, [regionGroup, sort, reloadTrigger]);

  const fetchMoreFestivals = async () => {
    if (!nextCursor || isFetchingMore) {
      return;
    }

    try {
      setIsFetchingMore(true);

      const result = await getRegionalFestivals(
        regionGroup,
        sort,
        nextCursor
      );

      setRegionalFestivals((prev) => [
        ...prev,
        ...result.festivals,
      ]);

      setNextCursor(result.nextCursor ?? null);
    } catch (error) {
      console.error(
        '지역별 축제 추가 조회 실패:',
        error
      );
      if (isRetryableError(error)) {
        setFailedRequest({
          retry: fetchMoreFestivals,
          isOffline:
            error instanceof NetworkOfflineError,
        });
      } else {
        setInfoError(
          error instanceof ApiError
            ? error.message
            : '정보를 불러오지 못했어요.',
        );
      }
    } finally {
      setIsFetchingMore(false);
    }
  };

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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <PageLoadingIndicator />
        </View>
      ) : hasRegionalFestivals ? (
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
            keyExtractor={(item) => String(item.festivalId)}
            renderItem={({ item }) => (
              <MainItemBlock
                type='festival'
                festival={item}
                onPress={() =>
                  router.push({
                    pathname: '/festival-detail/[id]',
                    params: { id: item.festivalId },
                  })
                }
              />
            )}
            ItemSeparatorComponent={() => (
              <View style={{ height: 10 }} />
            )}
            onEndReached={fetchMoreFestivals}
            onEndReachedThreshold={0.5}
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
      <ErrorModal
        visible={failedRequest !== null}
        title={failedRequest?.isOffline ? '오프라인 상태예요' : undefined}
        description={
          failedRequest?.isOffline
            ? '인터넷 연결을 확인한 후 다시 시도해 주세요.'
            : undefined
        }
        onCancel={() => setFailedRequest(null)}
        onRetry={retryFailedRequest}
      />
      <AlertModal
        visible={infoError !== null}
        title="오류"
        description={infoError ?? ''}
        confirmText="확인"
        onClose={() => setInfoError(null)}
        onConfirm={() => setInfoError(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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