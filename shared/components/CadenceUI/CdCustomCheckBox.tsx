import { Text, TouchableOpacity } from "react-native";
import { styles } from "../../auth/components/style";

interface CdCheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const CdCustomCheckbox: React.FC<CdCheckboxProps> = ({
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
