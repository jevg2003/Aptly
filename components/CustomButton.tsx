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
  const isOutline = variant === 'outline';
  const isSocial = variant === 'social';

  const buttonStyle = isPrimary
    ? 'bg-[#2b468b] shadow-lg shadow-[#2b468b]/30 active:bg-blue-900'
    : isOutline || isSocial
    ? 'bg-white border border-gray-100 shadow-sm active:bg-gray-50'
    : 'bg-white border border-gray-200 shadow-sm active:bg-gray-50';

  const textStyle = isPrimary ? 'text-white font-bold' : 'text-slate-600 font-semibold';

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
        <MaterialCommunityIcons name="github" size={20} color="#000" style={{ marginRight: 10 }} />
      );
    }

    return (
      <MaterialCommunityIcons 
        name={icon as any} 
        size={20} 
        color={isPrimary ? "white" : "#2b468b"} 
        style={{ marginRight: 10 }} 
      />
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`${buttonStyle} flex-row items-center justify-center py-[15px] rounded-[30px] mb-3 ${className}`}
    >
      <View className="flex-row items-center">
        {renderIcon()}
        <Text className={`${textStyle} text-base text-center`}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};