import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SearchType = 'festival' | 'tour';

type RecentSearchState = {
  recentSearches: Record<SearchType, string[]>;

  addRecentSearch: (
    type: SearchType,
    keyword: string
  ) => void;

  removeRecentSearch: (
    type: SearchType,
    keyword: string
  ) => void;
};

const MAX_RECENT_SEARCHES = 30;

export const useRecentSearchStore =
  create<RecentSearchState>()(
    persist(
      (set) => ({
        recentSearches: {
          festival: [],
          tour: [],
        },

        addRecentSearch: (type, keyword) => {
          const trimmedKeyword = keyword.trim();

          if (!trimmedKeyword) return;

          set((state) => {
            const current = state.recentSearches[type];

            const filtered = current.filter(
              (item) => item !== trimmedKeyword
            );

            return {
              recentSearches: {
                ...state.recentSearches,
                [type]: [
                  trimmedKeyword,
                  ...filtered,
                ].slice(0, MAX_RECENT_SEARCHES),
              },
            };
          });
        },

        removeRecentSearch: (type, keyword) => {
          set((state) => ({
            recentSearches: {
              ...state.recentSearches,
              [type]: state.recentSearches[type].filter(
                (item) => item !== keyword
              ),
            },
          }));
        },

      }),
      {
        name: 'recent-search-storage',
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  );