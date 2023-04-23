export const transformValues = <K extends string, V, R>(record: Record<K, V>, valueTransform: (value: V) => R): Record<K, R> =>
  (Object.entries(record) as [K, V][]).reduce((transformedRecord, [key, value]) => ({
    ...transformedRecord,
    [key]: valueTransform(value),
  }), {} as Record<K, R>);

export const mapValues = <K extends string, V, R>(record: Record<K, V>, valueTransform: (value: V) => R): R[] =>
  (Object.values(record) as V[]).map(valueTransform);

export const mapEntries = <K extends string, V, R>(record: Record<K, V>, entryTransform: (entry: [K, V]) => R): R[] =>
  (Object.entries(record) as [K, V][]).map(entryTransform);

export const filterEntries = <K extends string, V>(record: Record<K, V>, predicate: (entry: [K, V]) => boolean): Record<K, V> =>
  (Object.entries(record) as [K, V][]).reduce((filteredRecord, entry) =>
    predicate(entry) ? {
      ...filteredRecord,
      [entry[0]]: entry[1],
    } : filteredRecord,
    {} as Record<K, V>
  );

export const associateWith = <T extends string, V>(array: T[], transform: (element: T) => V) =>
  array.reduce((accum, element) => ({ ...accum, [element]: transform(element) }), {} as Record<T, V>)

export const without = <T>(array: T[], elementToRemove: T): T[] =>
  array.reduce((accum, element) => element === elementToRemove ? accum : [...accum, element], [] as T[]);

export const union = <T>(array1: T[], array2: T[]): T[] =>
  array2.reduce((accum, element) => array1.includes(element) ? accum : [...accum, element], array1);

export const omitKey = <K extends string, V>(record: Record<K, V>, keyToOmit: K): Record<K, V> =>
  record.hasOwnProperty(keyToOmit)
    ? (Object.entries(record) as [K, V][]).reduce((transformedRecord, [key, value]) => key === keyToOmit ? transformedRecord : {
      ...transformedRecord,
      [key]: value,
    }, {} as Record<K, V>)
    : record;

export const omitKeys = <K extends string, V>(record: Record<K, V>, keysToOmit: K[]): Record<K, V> =>
  keysToOmit.reduce(omitKey, record);

export const isEmpty = (objOrArray: any): boolean => (objOrArray instanceof Array ? objOrArray : Object.keys(objOrArray)).length === 0;

export const flatten = <T>(array: T[][]) => array.reduce((accum, nextArray) => [...accum, ...nextArray], []);
