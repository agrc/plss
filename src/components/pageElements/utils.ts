export const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  timeZone: 'America/Denver',
});

export type SortOrder = 'Ascending (0-9 A-Z)' | 'Descending (Z-A 0-9)' | 'New to Old' | 'Old to New';

type SortValues = {
  a: string;
  b: string;
};

export const sortFunction = <Item>(sortOrder: SortOrder, transform: (one: Item, two: Item) => SortValues) => {
  return (one: Item, two: Item): number => {
    const { a, b } = transform(one, two);
    switch (sortOrder) {
      case 'New to Old':
        return Date.parse(b) - Date.parse(a);
      case 'Old to New':
        return Date.parse(a) - Date.parse(b);
      case 'Ascending (0-9 A-Z)':
        return a.localeCompare(b);
      case 'Descending (Z-A 0-9)':
        return b.localeCompare(a);
      default:
        return 0;
    }
  };
};

export const normalizePointId = (pointId?: string): string => {
  return pointId?.trim() ?? '';
};
