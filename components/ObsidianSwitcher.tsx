import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolateColor 
} from 'react-native-reanimated';

interface ObsidianSwitcherProps {
  options: string[];
  activeOption: string;
  onOptionChange: (option: string) => void;
  accentColor?: string;
}

export const ObsidianSwitcher: React.FC<ObsidianSwitcherProps> = ({
  options,
  activeOption,
  onOptionChange,
  accentColor = '#00A3FF' // Default to Candidate blue
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndex = options.indexOf(activeOption);
  const switchAnim = useSharedValue(activeIndex);

  useEffect(() => {
    switchAnim.value = withSpring(activeIndex, { damping: 15, stiffness: 100 });
  }, [activeIndex]);

  const animatedPillStyle = useAnimatedStyle(() => {
    const isMoving = switchAnim.value % 1 !== 0; // Simplified moving check
    const stretch = withSpring(isMoving ? 1.05 : 1, { damping: 10 });
    
    // Calculate position: (containerWidth - padding) / numOptions
    const itemWidth = (containerWidth - 12) / options.length;

    return {
      width: itemWidth,
      transform: [
        { translateX: switchAnim.value * itemWidth },
        { scaleX: stretch }
      ],
      backgroundColor: accentColor,
      shadowColor: accentColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
    };
  });

  return (
    <View 
      style={styles.container}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View style={[styles.pill, animatedPillStyle]} />
      {options.map((option, index) => (
        <TouchableOpacity
          key={option}
          onPress={() => onOptionChange(option)}
          style={styles.optionButton}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.optionText,
            activeOption === option && styles.optionTextActive
          ]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 6,
    marginHorizontal: 20,
    marginVertical: 10,
    position: 'relative',
    height: 54,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  pill: {
    position: 'absolute',
    top: 6,
    left: 6,
    bottom: 6,
    borderRadius: 12,
    zIndex: 0,
  },
  optionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  }
});
