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
  multiline?: boolean;
  numberOfLines?: number;
  className?: string;
}

export const CustomInput = ({
  placeholder,
  value,
  onChangeText,
  iconName,
  isPassword = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  className = '',
}: CustomInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View 
      className={`
        flex-row items-start border rounded-[22px] px-5 py-[12px] mb-4 
        ${isFocused ? 'border-primary' : 'border-slate-100 dark:border-slate-800'} 
        bg-white dark:bg-slate-900 shadow-sm shadow-slate-200 dark:shadow-none
        ${className}
      `}
    >
      <MaterialCommunityIcons 
        name={iconName} 
        size={20} 
        color={isFocused ? "#2B468B" : "#94a3b8"} 
        style={{ marginTop: multiline ? 4 : 0 }}
      />
      <TextInput
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`flex-1 ml-3 text-slate-800 dark:text-slate-100 text-base ${multiline ? 'min-h-[80px]' : 'py-1'}`}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isPassword && !showPassword}
        keyboardType={keyboardType}
        autoCapitalize="none"
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {isPassword && (
        <TouchableOpacity 
          onPress={() => setShowPassword(!showPassword)} 
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ marginTop: 4 }}
        >
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
