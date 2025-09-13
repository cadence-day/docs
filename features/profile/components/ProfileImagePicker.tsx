import React from "react";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";
import { CdButton } from "@/shared/components/CadenceUI";

type Props = {
  currentImageUrl?: string | null;
  onPick: (url: string) => void;
};

// Minimal placeholder picker: accepts a URL and previews it.
export const ProfileImagePicker: React.FC<Props> = ({
  currentImageUrl,
  onPick,
}) => {
  const [value, setValue] = React.useState<string>(currentImageUrl || "");
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Image URL</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        style={styles.input}
        placeholder="https://..."
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value ? (
        <Image source={{ uri: value }} style={styles.preview} />
      ) : (
        <View style={[styles.preview, styles.previewPlaceholder]} />
      )}
      <CdButton
        title="Use Photo"
        onPress={() => onPick(value)}
        variant="primary"
        fullWidth
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { color: "#444" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
  },
  preview: { width: "100%", height: 160, borderRadius: 8 },
  previewPlaceholder: { backgroundColor: "#eee" },
});

export default ProfileImagePicker;
