import { MantineThemeOverride } from '@mantine/core';

export const primaryColor = 'teal';
export const nextToPrimaryColor = 'rgba(20, 177, 163)';

const theme: MantineThemeOverride = {
  defaultGradient: { deg: 60, from: primaryColor, to: nextToPrimaryColor },
  primaryColor,
};

export default theme;
