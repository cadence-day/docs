import { formatEncryptedText } from "../api/encryption/core";

/**
 * React hook to format encrypted text for display
 * @param value The text value to display
 * @param isVisualizationMode Whether encryption visualization is enabled
 * @param showEncryptedAsStars Whether to show encrypted data as stars or binary
 * @returns The formatted text for display
 */
export function useEncryptedTextDisplay(
    value: string,
    isVisualizationMode: boolean,
    showEncryptedAsStars: boolean,
): string {
    return formatEncryptedText(
        value,
        showEncryptedAsStars,
        isVisualizationMode,
    );
}

/**
 * Simple helper to display encrypted text
 * @param value The text value to display
 * @param isVisualizationMode Whether encryption visualization is enabled
 * @param showEncryptedAsStars Whether to show encrypted data as stars or binary
 * @returns The formatted text for display
 */
export function displayEncryptedText(
    value: string,
    isVisualizationMode: boolean,
    showEncryptedAsStars: boolean,
): string {
    return formatEncryptedText(
        value,
        showEncryptedAsStars,
        isVisualizationMode,
    );
}
