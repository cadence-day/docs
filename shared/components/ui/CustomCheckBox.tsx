import { Text, TouchableOpacity } from "react-native";
import { styles } from "../Screens/style";

interface CheckboxProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }

export const CustomCheckbox: React.FC<CheckboxProps> = ({
    value,
    onValueChange,
    disabled,
  }) => (
    <TouchableOpacity
      style={[styles.checkboxBox, value && styles.checkboxBoxChecked]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {value && <Text style={styles.checkboxCheck}>✓</Text>}
    </TouchableOpacity>
  );