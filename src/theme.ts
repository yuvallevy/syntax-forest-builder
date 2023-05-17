import { MantineThemeOverride } from '@mantine/core';

const primaryColor = 'teal';
const nextToPrimaryColor = 'rgba(20, 177, 163)';

const theme: MantineThemeOverride = {
  defaultGradient: { deg: 60, from: primaryColor, to: nextToPrimaryColor },
  primaryColor,
  fontFamily: '"Wix Madefor Text",-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Helvetica",' +
    '"Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif',
};

export default theme;
