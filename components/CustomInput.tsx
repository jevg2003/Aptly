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
        flex-row items-center border rounded-[22px] px-5 py-[12px] mb-4 
        ${isFocused ? 'border-primary-light' : 'border-white/5'} 
        bg-zinc-900/50 shadow-sm
        ${className}
      `}
      style={{ backgroundColor: '#1A1A1C' }}
    >
      <MaterialCommunityIcons 
        name={iconName} 
        size={20} 
        color={isFocused ? "#00A3FF" : "#64748b"} 
        style={{ marginTop: multiline ? 4 : 0 }}
      />
      <TextInput
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`flex-1 ml-3 text-white text-base ${multiline ? 'min-h-[80px]' : 'py-1'}`}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
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
        >
          <MaterialCommunityIcons 
            name={showPassword ? "eye-off-outline" : "eye-outline"} 
            size={20} 
            color={isFocused ? "#00A3FF" : "#64748b"} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};
