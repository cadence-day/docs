import React, { useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { ACTIVITY_COLOR_PALETTE, ACTIVITY_THEME } from '../../../constants';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  disabled?: boolean;
  label: string;
  buttonText: string;
}

export const ColorPicker = React.memo<ColorPickerProps>(({
  selectedColor,
  onColorChange,
  disabled = false,
  label,
  buttonText,
}) => {
  const [showPicker, setShowPicker] = React.useState(false);

  const handleTogglePicker = useCallback(() => {
    setShowPicker(prev => !prev);
  }, []);

  const handleColorSelect = useCallback((color: string) => {
    onColorChange(color);
    setShowPicker(false);
  }, [onColorChange]);

  const renderColorOption = useCallback(({ item: color }: { item: string }) => (
    <Pressable
      style={[
        styles.colorOption,
        { backgroundColor: color },
        color === selectedColor && styles.selectedColor,
      ]}
      onPress={() => handleColorSelect(color)}
    />
  ), [selectedColor, handleColorSelect]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.colorButton, { backgroundColor: selectedColor }]}
        onPress={handleTogglePicker}
        disabled={disabled}
      >
        <Text style={styles.colorButtonText}>{buttonText}</Text>
      </TouchableOpacity>

      {showPicker && !disabled && (
        <View style={styles.colorGrid}>
          <FlatList
            data={ACTIVITY_COLOR_PALETTE}
            numColumns={5}
            keyExtractor={(item) => item}
            renderItem={renderColorOption}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
});

ColorPicker.displayName = 'ColorPicker';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: ACTIVITY_THEME.WHITE,
    marginBottom: 6,
    textTransform: "uppercase",
    fontFamily: "FoundersGrotesk-Regular",
  },
  colorButton: {
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: ACTIVITY_THEME.BORDER_PURPLE,
    borderBottomWidth: 0.5,
  },
  colorButtonText: {
    color: ACTIVITY_THEME.WHITE,
    fontSize: 14,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  colorGrid: {
    marginTop: 10,
    backgroundColor: ACTIVITY_THEME.FORM_BG,
    borderRadius: 8,
    padding: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 5,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: ACTIVITY_THEME.WHITE,
  },
});