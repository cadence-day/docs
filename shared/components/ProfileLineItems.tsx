import { View, TouchableOpacity, Text, TextInput } from "react-native";
import { useState } from "react";

interface LineItemProps {
  title: string;
  value: string | number;
}

interface LineItemWithButtonProps extends LineItemProps {
  callBack: () => void;
}

interface EditableLineItemProps extends LineItemProps {
  onUpdate: (newValue: string) => void;
}

// Base styles for consistency
const baseContainerStyle = {
  width: "100%" as const,
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  borderBottomWidth: 0.5,
  borderColor: "#6646EC",
  marginBottom: 18,
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 8,
};

const titleStyle = {
  fontSize: 14,
  color: "#575453",
  fontWeight: "500" as const,
};

// Read-only line item
export const LineItem: React.FC<LineItemProps> = ({ title, value }) => (
  <View style={baseContainerStyle}>
    <Text style={titleStyle}>{title}</Text>
    <Text style={{ fontSize: 14, color: "#333", fontWeight: "600" }}>
      {value}
    </Text>
  </View>
);

// Interactive line item with button
export const LineItemWithButton: React.FC<LineItemWithButtonProps> = ({
  title,
  value,
  callBack,
}) => (
  <View style={baseContainerStyle}>
    <Text style={titleStyle}>{title}</Text>
    <TouchableOpacity onPress={callBack}>
      <Text style={{ fontSize: 14, color: "#6646EC", fontWeight: "600" }}>
        {value}
      </Text>
    </TouchableOpacity>
  </View>
);

// Editable line item (simplified)
export const EditableLineItem: React.FC<EditableLineItemProps> = ({
  title,
  value,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));

  const handlePress = () => {
    setIsEditing(true);
    setEditValue(String(value));
  };

  const handleSubmit = () => {
    if (editValue.trim() !== String(value)) {
      onUpdate(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value));
    setIsEditing(false);
  };

  return (
    <View
      style={{
        ...baseContainerStyle,
        backgroundColor: isEditing ? "#F5F3FF" : "transparent",
      }}>
      <Text style={titleStyle}>{title}</Text>
      {isEditing ? (
        <TextInput
          style={{
            fontSize: 14,
            color: "#6646EC",
            fontWeight: "600",
            minWidth: 100,
            textAlign: "right",
            borderBottomWidth: 1,
            borderBottomColor: "#6646EC",
            paddingBottom: 2,
          }}
          value={editValue}
          onChangeText={setEditValue}
          onSubmitEditing={handleSubmit}
          onBlur={handleSubmit}
          onKeyPress={(e) => {
            if (e.nativeEvent.key === "Escape") {
              handleCancel();
            }
          }}
          autoFocus
          returnKeyType="done"
          blurOnSubmit={true}
        />
      ) : (
        <TouchableOpacity onPress={handlePress}>
          <Text
            style={{
              fontSize: 14,
              color: "#6646EC",
              fontWeight: "600",
              textDecorationLine: "underline",
            }}>
            {value}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
