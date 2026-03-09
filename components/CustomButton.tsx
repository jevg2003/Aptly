import { TouchableOpacity, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface CustomButtonProps {
  title: string;
  iconName?: keyof typeof FontAwesome.glyphMap;
  onPress: () => void;
  variant?: 'white' | 'dark' | 'primary';
  className?: string;
}

export const CustomButton = ({ title, iconName, onPress, variant = 'primary', className }: CustomButtonProps) => {
  const themes = {
    white: "bg-white border border-gray-200 shadow-sm",
    dark: "bg-[#24292e] shadow-md",
    primary: "bg-[#2b468b] shadow-lg shadow-blue-900/20"
  };

  const textColors = {
    white: "text-gray-700",
    dark: "text-white",
    primary: "text-white"
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`${themes[variant]} flex-row items-center justify-center p-4 rounded-2xl mb-4 ${className}`}
    >
      {iconName && (
        <FontAwesome 
          name={iconName} 
          size={20} 
          color={variant === 'white' ? '#444' : 'white'} 
          style={{ marginRight: 12 }} 
        />
      )}
      <Text className={`${textColors[variant]} font-bold text-base`}>{title}</Text>
    </TouchableOpacity>
  );
};