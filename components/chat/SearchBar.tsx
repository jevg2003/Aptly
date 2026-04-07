import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChangeText, placeholder = 'Search conversations' }: SearchBarProps) => {
  return (
    <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 mx-4 my-2 border border-slate-200 dark:border-slate-700">
      <Feather name="search" size={18} color="#94a3b8" className="mr-2" />
      <TextInput
        className="flex-1 text-slate-800 dark:text-slate-200 text-base py-1"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
      />
    </View>
  );
};
