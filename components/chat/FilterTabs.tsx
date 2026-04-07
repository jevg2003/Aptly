import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export type FilterParam = 'All' | 'Unread' | 'Archived';

interface FilterTabsProps {
  activeFilter: FilterParam;
  onFilterChange: (filter: FilterParam) => void;
}

const filters: FilterParam[] = ['All', 'Unread', 'Archived'];

export const FilterTabs = ({ activeFilter, onFilterChange }: FilterTabsProps) => {
  return (
    <View className="flex-row border-b border-slate-200 dark:border-slate-800 mx-4">
      {filters.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <TouchableOpacity
            key={filter}
            onPress={() => onFilterChange(filter)}
            className={`flex-1 items-center py-3 border-b-2 ${
              isActive ? 'border-blue-600' : 'border-transparent'
            }`}
          >
            <Text
              className={`font-medium ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
