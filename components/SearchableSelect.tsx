import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface Option {
  name: string;
  flag?: string;
  subtext?: string;
}

interface SearchableSelectProps {
  placeholder: string;
  value: string;
  onSelect: (value: string) => void;
  options: (string | Option)[];
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  disabled?: boolean;
  role?: 'candidate' | 'company';
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  hideIcon?: boolean;
  compact?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SearchableSelect = ({
  placeholder,
  value,
  onSelect,
  options,
  iconName,
  disabled = false,
  role = 'candidate',
  label,
  containerStyle,
  hideIcon = false,
  compact = false,
}: SearchableSelectProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeColor = role === 'company' ? '#FF005C' : '#00A3FF';

  // Normalize string for searching (removes accents and converts to lowercase)
  const normalizeText = (text: string) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Standardize options into Option objects
  const parsedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { name: opt };
      }
      return opt;
    });
  }, [options]);

  // Filter options based on the search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return parsedOptions;
    }
    const normalizedQuery = normalizeText(searchQuery);
    return parsedOptions.filter(
      (opt) =>
        normalizeText(opt.name).includes(normalizedQuery) ||
        (opt.subtext && normalizeText(opt.subtext).includes(normalizedQuery))
    );
  }, [parsedOptions, searchQuery]);

  const handleSelect = (itemValue: string) => {
    onSelect(itemValue);
    setModalVisible(false);
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const handleOpen = () => {
    if (!disabled) {
      setModalVisible(true);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    setSearchQuery('');
    Keyboard.dismiss();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        activeOpacity={disabled ? 1 : 0.7}
        onPress={handleOpen}
        style={[
          styles.trigger,
          compact && { paddingHorizontal: 10, paddingVertical: 10, borderRadius: 16 },
          { opacity: disabled ? 0.5 : 1 },
          modalVisible
            ? { borderColor: activeColor }
            : { borderColor: 'rgba(255, 255, 255, 0.05)' },
        ]}>
        <View style={styles.leftContainer}>
          {!hideIcon && iconName && (
            <MaterialCommunityIcons
              name={iconName}
              size={20}
              color={modalVisible ? activeColor : '#64748b'}
            />
          )}
          <Text
            style={[
              styles.triggerText,
              compact && { marginLeft: hideIcon ? 2 : 6, fontSize: 14 },
              !value && styles.placeholderText,
            ]}
            numberOfLines={1}>
            {value || placeholder}
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-down"
          size={compact ? 16 : 20}
          color="#64748b"
          style={compact && { marginLeft: 2 }}
        />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={handleClose}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>
            {Platform.OS === 'ios' ? (
              <BlurView tint="dark" intensity={70} style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.85)' }]} />
            )}

            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.modalContent}>
                <View style={styles.modalCard}>
                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{placeholder}</Text>
                    <TouchableOpacity
                      onPress={handleClose}
                      style={styles.closeButton}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                      <MaterialCommunityIcons name="close" size={22} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>

                  {/* Search Bar */}
                  <View style={[styles.searchBar, { borderColor: 'rgba(255, 255, 255, 0.05)' }]}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Escribe para buscar..."
                      placeholderTextColor="#64748b"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCorrect={false}
                      autoCapitalize="sentences"
                      returnKeyType="done"
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setSearchQuery('')}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <MaterialCommunityIcons name="close-circle" size={18} color="#64748b" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Options List */}
                  <FlatList
                    data={filteredOptions}
                    keyExtractor={(item, index) => `${item.name}-${index}`}
                    style={styles.list}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={true}
                    indicatorStyle="white"
                    ListEmptyComponent={
                      <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons
                          name="map-marker-question-outline"
                          size={40}
                          color="#475569"
                        />
                        <Text style={styles.emptyText}>No se encontraron resultados</Text>
                      </View>
                    }
                    renderItem={({ item }) => {
                      const isSelected = value === item.name;
                      return (
                        <TouchableOpacity
                          activeOpacity={0.6}
                          onPress={() => handleSelect(item.name)}
                          style={[
                            styles.optionItem,
                            isSelected && { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                          ]}>
                          <View style={styles.optionLeft}>
                            {item.flag ? <Text style={styles.flagText}>{item.flag}</Text> : null}
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.optionText,
                                  isSelected && { color: activeColor, fontWeight: '600' },
                                ]}
                                numberOfLines={1}>
                                {item.name}
                              </Text>
                              {item.subtext ? (
                                <Text
                                  style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}
                                  numberOfLines={1}>
                                  {item.subtext}
                                </Text>
                              ) : null}
                            </View>
                          </View>
                          {isSelected && (
                            <MaterialCommunityIcons
                              name="check"
                              size={20}
                              color={activeColor}
                              style={{ marginLeft: 8 }}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#1A1A1C',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  triggerText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  placeholderText: {
    color: '#64748b',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: SCREEN_HEIGHT * 0.75,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1C1C1E',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    marginLeft: 8,
    padding: 0,
  },
  list: {
    maxHeight: SCREEN_HEIGHT * 0.45,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 4,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagText: {
    fontSize: 18,
    marginRight: 12,
  },
  optionText: {
    color: '#e2e8f0',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
