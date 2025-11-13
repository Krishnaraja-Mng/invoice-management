import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'Ubuntu-Regular',
      fontWeight: 'normal' as const,
    },
    medium: {
      fontFamily: 'Ubuntu-Medium',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'Ubuntu-Light',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'Ubuntu-Light',
      fontWeight: '300' as const,
    },
  },
};
