import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CustomInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  isPassword?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export const CustomInput = ({
  placeholder,
  value,
  onChangeText,
  iconName,
  isPassword = false,
  keyboardType = 'default',
}: CustomInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View 
      className={`flex-row items-center border ${isFocused ? 'border-[#2B468B]' : 'border-slate-100'} rounded-[20px] px-5 py-[10px] mb-4 bg-white shadow-sm shadow-slate-100`}
    >
      <MaterialCommunityIcons 
        name={iconName} 
        size={20} 
        color={isFocused ? "#2B468B" : "#94a3b8"} 
      />
      <TextInput
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="flex-1 ml-3 text-slate-700 text-base py-1"
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isPassword && !showPassword}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      {isPassword && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons 
            name={showPassword ? "eye-off-outline" : "eye-outline"} 
            size={20} 
            color={isFocused ? "#2B468B" : "#94a3b8"} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};
