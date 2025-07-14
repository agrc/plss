export const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  timeZone: 'MST',
});

export const sortFunction = (sortOrder, transform) => {
  return (one, two) => {
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
