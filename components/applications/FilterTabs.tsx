import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export type AppFilterParam = 'Todas' | 'Activas' | 'Finalizadas';

interface FilterTabsProps {
  activeFilter: AppFilterParam;
  onFilterChange: (filter: AppFilterParam) => void;
}

const filters: AppFilterParam[] = ['Todas', 'Activas', 'Finalizadas'];

export const FilterTabs = ({ activeFilter, onFilterChange }: FilterTabsProps) => {
  return (
    <View className="flex-row border-b border-slate-100 dark:border-slate-800 mx-4">
      {filters.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <TouchableOpacity
            key={filter}
            onPress={() => onFilterChange(filter)}
            className={`mr-6 py-4 border-b-2 px-1 ${
              isActive ? 'border-blue-600' : 'border-transparent'
            }`}
          >
            <Text
              className={`font-semibold ${
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
