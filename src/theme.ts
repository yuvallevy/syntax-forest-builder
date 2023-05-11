import { MantineThemeOverride } from '@mantine/core';

const primaryColor = 'teal';
const nextToPrimaryColor = 'rgba(20, 177, 163)';

const theme: MantineThemeOverride = {
  defaultGradient: { deg: 60, from: primaryColor, to: nextToPrimaryColor },
  primaryColor,
};

export default theme;
