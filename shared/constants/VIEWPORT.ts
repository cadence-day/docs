import { useSafeAreaInsets } from "react-native-safe-area-context"; // import bottom insets of the safe area for ios

export const BASE_NAV_BAR_SIZE = 50; // Base size for nav bar

export const DIALOG_HEIGHT_PLACEHOLDER = 35; // Space for draggable dialog handle

export function useNavBarSize(): number {
    const insets = useSafeAreaInsets();
    return BASE_NAV_BAR_SIZE + insets.bottom;
}
