import React from 'react';
import { TouchableOpacity, Text, View, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'social';
  icon?: keyof typeof MaterialCommunityIcons.glyphMap | 'google' | 'github';
  className?: string;
  loading?: boolean;
}

export const CustomButton = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  className = '',
}: CustomButtonProps) => {
  const isPrimary = variant === 'primary';

  const themes = {
    primary: "bg-[#FF005C] shadow-2xl shadow-[#FF005C]/30 active:bg-[#D4004D]",
    outline: "bg-[#121214] border-2 border-[#1e1e1e] shadow-sm active:bg-[#1a1a1c]",
    social: "bg-white dark:bg-[#1A1A1C] border border-slate-50 dark:border-[#1e1e1e] shadow-sm active:bg-gray-50"
  };

  const textColors = {
    primary: "text-white font-black tracking-tighter",
    outline: "text-white font-bold",
    social: "text-slate-600 dark:text-white font-semibold"
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    if (icon === 'google') {
      return (
        <Image 
          source={{ uri: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png' }} 
          className="w-5 h-5 mr-3"
          resizeMode="contain"
        />
      );
    }
    
    if (icon === 'github') {
      return (
        <MaterialCommunityIcons 
          name="github" 
          size={20} 
          color={isPrimary ? "white" : "#000"} 
          className="dark:text-white"
          style={{ marginRight: 10 }} 
        />
      );
    }

    return (
      <MaterialCommunityIcons 
        name={icon as any} 
        size={20} 
        color={isPrimary ? "white" : "#2B468B"} 
        style={{ marginRight: 10 }} 
      />
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`${themes[variant]} flex-row items-center justify-center rounded-[25px] py-5 px-6 ${className}`}
    >
      <View className="flex-row items-center justify-center">
        {renderIcon()}
        <Text className={`${textColors[variant]} text-base uppercase`}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};