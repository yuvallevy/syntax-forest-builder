export const transformValues = <K extends string, V, R>(record: Record<K, V>, valueTransform: (value: V) => R): Record<K, R> =>
  (Object.entries(record) as [K, V][]).reduce((transformedRecord, [key, value]) => ({
    ...transformedRecord,
    [key]: valueTransform(value),
  }), {} as Record<K, R>);

export const mapValues = <K extends string, V, R>(record: Record<K, V>, valueTransform: (value: V) => R): R[] =>
  (Object.values(record) as V[]).map(valueTransform);

export const mapEntries = <K extends string, V, R>(record: Record<K, V>, entryTransform: (entry: [K, V]) => R): R[] =>
  (Object.entries(record) as [K, V][]).map(entryTransform);
