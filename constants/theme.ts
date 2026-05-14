/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    danger: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    icon: '#64748B',
    cardLight: '#F1F5F9', // Para hover/pressed states
  },
  dark: {
    background: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    border: '#334155',
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    danger: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    icon: '#94A3B8',
    cardLight: '#334155', // Para hover/pressed states
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
