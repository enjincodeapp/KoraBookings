/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#874d32',
    onPrimary: '#ffffff',
    primaryFixed: '#ffdbcd',
    secondary: '#496455',
    onSecondary: '#ffffff',
    secondaryContainer: '#ccead6',
    onSecondaryContainer: '#4f6a5b',
    tertiary: '#675a41',
    tertiaryFixed: '#f3e0c0',
    onTertiaryFixed: '#231a06',
    background: '#fcf9f8',
    onBackground: '#1b1c1c',
    surface: '#fcf9f8',
    onSurface: '#1b1c1c',
    surfaceVariant: '#e4e2e1',
    onSurfaceVariant: '#53433e',
    outline: '#85736c',
    outlineVariant: '#d8c2ba',
    tint: '#874d32',
    icon: '#53433e',
    tabIconDefault: '#85736c',
    tabIconSelected: '#874d32',
    error: '#ba1a1a',
  },
  dark: {
    primary: '#ffb596',
    onPrimary: '#360f00',
    primaryFixed: '#ffdbcd',
    secondary: '#b0cdbb',
    onSecondary: '#062014',
    secondaryContainer: '#324c3e',
    onSecondaryContainer: '#ccead6',
    tertiary: '#d6c4a5',
    tertiaryFixed: '#f3e0c0',
    onTertiaryFixed: '#231a06',
    background: '#1b1c1c',
    onBackground: '#e4e2e1',
    surface: '#1b1c1c',
    onSurface: '#e4e2e1',
    surfaceVariant: '#53433e',
    onSurfaceVariant: '#d8c2ba',
    outline: '#85736c',
    outlineVariant: '#53433e',
    tint: '#ffb596',
    icon: '#d8c2ba',
    tabIconDefault: '#85736c',
    tabIconSelected: '#ffb596',
    error: '#ffdad6',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
