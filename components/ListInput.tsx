import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ListInputProps {
  label: string;
  items: string[];
  setItems: (items: string[]) => void;
  placeholder?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export const ListInput = ({ label, items, setItems, placeholder, iconName }: ListInputProps) => {
  const [text, setText] = useState('');

  const addItem = () => {
    if (text.trim()) {
      setItems([...items, text.trim()]);
      setText('');
    }
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  return (
    <View className="mb-6">
      <Text className="text-white font-bold mb-3 ml-1">{label}</Text>
      
      <View className="flex-row items-center bg-[#121214] rounded-2xl border border-white/5 px-4 h-14 mb-4">
        {iconName && <Ionicons name={iconName} size={20} color="#64748b" style={{ marginRight: 12 }} />}
        <TextInput
          className="flex-1 text-white text-sm"
          placeholder={placeholder || "Añadir elemento..."}
          placeholderTextColor="#64748b"
          value={text}
          onChangeText={setText}
          onSubmitEditing={addItem}
        />
        <TouchableOpacity 
          onPress={addItem}
          className="w-8 h-8 rounded-full bg-[#FF005C] items-center justify-center"
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {items.map((item, index) => (
          <View 
            key={index} 
            className="flex-row items-center bg-[#1A1A1C] px-3 py-2 rounded-xl border border-white/5"
          >
            <Text className="text-slate-300 text-xs mr-2">{item}</Text>
            <TouchableOpacity onPress={() => removeItem(index)}>
              <Ionicons name="close-circle" size={16} color="#FF005C" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};
