import { TouchableOpacity, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface SocialButtonProps {
  title: string;
  icon: keyof typeof FontAwesome.glyphMap;
  variant: 'google' | 'github' | 'primary';
  onPress?: () => void;
}

export const SocialButton = ({ title, icon, variant, onPress }: SocialButtonProps) => {
  const bg = variant === 'google' ? 'bg-white border border-gray-200' : 
             variant === 'github' ? 'bg-[#24292e]' : 'bg-[#2b468b]';
  
  const textColor = variant === 'google' ? 'text-gray-700' : 'text-white';
  const iconColor = variant === 'google' ? '#DB4437' : 'white';

  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`${bg} flex-row items-center justify-center py-4 rounded-xl mb-3 shadow-sm`}
    >
      <FontAwesome name={icon} size={20} color={iconColor} style={{ marginRight: 10 }} />
      <Text className={`${textColor} font-bold text-base`}>{title}</Text>
    </TouchableOpacity>
  );
};