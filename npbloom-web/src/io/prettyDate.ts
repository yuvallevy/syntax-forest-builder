const localeUpperFirst = (str: string, locale: string) => str[0].toLocaleUpperCase(locale) + str.slice(1);

const relativeFormat = (value: number, unit: Intl.RelativeTimeFormatUnit, locale: string) =>
  new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit);

const formatShortTime = (date: Date, locale: string) =>
  date.toLocaleTimeString(locale, { timeStyle: 'short' });

const prettyDate = (date: Date, locale: string) => {
  const now = new Date();
  if (date.toDateString() === now.toDateString())
    return `${localeUpperFirst(relativeFormat(0, 'day', locale), locale)}, ${formatShortTime(date, locale)}`;

  const yesterday = now;
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString())
    return `${localeUpperFirst(relativeFormat(-1, 'day', locale), locale)}, ${formatShortTime(date, locale)}`;

  return date.toLocaleString(locale,
    date.getFullYear() === now.getFullYear()
      ? { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }  // e.g. 'Dec 3, 10:35 PM'
      : { dateStyle: 'short', timeStyle: 'short' }  // e.g. '12/3/2023, 10:35 PM'
  );
};

export default prettyDate;
