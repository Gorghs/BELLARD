const searchCache = new Map<string, any[]>();

export const getCachedSearch = (query: string): any[] | null => {
  const cached = searchCache.get(query.toLowerCase());
  return cached ? cached : null;
};

export const setCachedSearch = (query: string, results: any[]) => {
  searchCache.set(query.toLowerCase(), results);
};

export const clearSearchCache = () => {
  searchCache.clear();
};
