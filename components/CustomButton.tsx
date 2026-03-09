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
    primary: "bg-[#2B468B] dark:bg-[#3458B0] shadow-xl shadow-blue-900/40 active:bg-blue-900",
    outline: "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm active:bg-gray-50",
    social: "bg-white dark:bg-slate-800 border border-slate-50 dark:border-slate-700 shadow-sm active:bg-gray-50"
  };

  const textColors = {
    primary: "text-white font-bold",
    outline: "text-slate-600 dark:text-slate-100 font-semibold",
    social: "text-slate-600 dark:text-slate-100 font-semibold"
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
      className={`${themes[variant]} flex-row items-center justify-center rounded-[30px] ${className}`}
    >
      <View className="flex-row items-center justify-center w-full">
        {renderIcon()}
        <Text className={`${textColors[variant]} text-base text-center`}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};