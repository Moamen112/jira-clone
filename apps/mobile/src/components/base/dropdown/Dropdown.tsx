import React, { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { colors } from '../../../tokens/colors';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';
import { layout } from '../../../tokens/layout';
import { Text } from '../typography/Text';
import { Modal } from '../modal/Modal';
import { Input } from '../input/Input';

export interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface DropdownProps {
  /** Field label placed above trigger */
  label?: string;
  /** Available options */
  options: DropdownOption[];
  /** Currently selected value */
  value?: string;
  /** Callback on selection */
  onSelect: (value: string) => void;
  /** Placeholder when nothing is selected */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Disable trigger */
  disabled?: boolean;
  /** Enable search input inside sheet */
  searchable?: boolean;
  /** Trigger container style */
  style?: ViewStyle;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onSelect,
  placeholder = 'Select an option...',
  error,
  disabled = false,
  searchable = false,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable && searchQuery
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const handleSelect = (val: string) => {
    onSelect(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  const borderColor = error
    ? colors.light.warn
    : isOpen
    ? colors.light.accent
    : colors.light.line;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      )}

      {/* Trigger Button */}
      <Pressable
        disabled={disabled}
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          {
            borderColor,
            backgroundColor: disabled
              ? colors.light.paper
              : colors.light.surface,
            opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          },
        ]}
      >
        <View style={styles.triggerContent}>
          {selectedOption?.icon && (
            <View style={styles.triggerIcon}>{selectedOption.icon}</View>
          )}
          <Text
            variant="body"
            color={selectedOption ? colors.light.ink : colors.light.inkMuted}
            numberOfLines={1}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>

        <Text variant="caption" muted style={styles.chevron}>
          â–¼
        </Text>
      </Pressable>

      {error && (
        <Text variant="errorText" color={colors.light.warn} style={styles.errorText}>
          {error}
        </Text>
      )}

      {/* Selection Bottom Sheet */}
      <Modal
        visible={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSearchQuery('');
        }}
        title={label || 'Select'}
        presentation="bottomSheet"
      >
        {searchable && (
          <Input
            placeholder="Search options..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            containerStyle={{ marginBottom: spacing[3] }}
          />
        )}

        <View style={styles.optionsList}>
          {filteredOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => handleSelect(opt.value)}
                style={({ pressed }) => [
                  styles.optionRow,
                  isSelected && styles.optionSelected,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <View style={styles.optionLeft}>
                  {opt.icon && <View style={styles.optionIcon}>{opt.icon}</View>}
                  <View>
                    <Text
                      variant="body"
                      bold={isSelected}
                      color={isSelected ? colors.light.accent : colors.light.ink}
                    >
                      {opt.label}
                    </Text>
                    {opt.description && (
                      <Text variant="caption" muted>
                        {opt.description}
                      </Text>
                    )}
                  </View>
                </View>

                {isSelected && (
                  <Text variant="body" bold color={colors.light.accent}>
                    âœ“
                  </Text>
                )}
              </Pressable>
            );
          })}

          {filteredOptions.length === 0 && (
            <View style={styles.emptySearch}>
              <Text variant="bodySmall" muted align="center">
                No matching options found.
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing[3],
  },
  label: {
    marginBottom: spacing[1],
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.tapTarget,
    borderWidth: 1,
    borderRadius: radius.input,
    paddingHorizontal: spacing[3],
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing[2],
  },
  triggerIcon: {
    marginRight: spacing[2],
  },
  chevron: {
    fontSize: 10,
  },
  errorText: {
    marginTop: spacing[1],
  },
  optionsList: {
    paddingVertical: spacing[1],
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.light.line,
  },
  optionSelected: {
    backgroundColor: colors.light.accentSoft,
    borderRadius: radius.input,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: spacing[3],
  },
  emptySearch: {
    paddingVertical: spacing[5],
  },
});

export default Dropdown;

