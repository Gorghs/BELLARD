import Fuse from "fuse.js";

let fuseInstance: Fuse<any> | null = null;

export const initFuse = (data: any[]) => {
  fuseInstance = new Fuse(data, {
    keys: [
      { name: "title", weight: 0.7 },
      { name: "artist", weight: 0.2 },
      { name: "album", weight: 0.1 },
    ],
    threshold: 0.3, // Fuzzy matching threshold (0.0 is perfect match, 1.0 matches anything)
    includeScore: true,
    ignoreLocation: true,
  });
};

export const searchLocal = (query: string) => {
  if (!fuseInstance || !query) return [];
  const results = fuseInstance.search(query);
  // Return the actual items, not the fuse wrapper
  return results.map((result) => result.item);
};
