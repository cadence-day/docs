// Re-export all styles from organized modules
export { layoutStyles } from './layout';
export { componentStyles } from './components';
export { typographyStyles } from './typography';

// Maintain backward compatibility by combining all styles
import { StyleSheet } from 'react-native';
import { layoutStyles } from './layout';
import { componentStyles } from './components';
import { typographyStyles } from './typography';

export const onboardingStyles = StyleSheet.create({
  ...layoutStyles,
  ...componentStyles,
  ...typographyStyles,
});