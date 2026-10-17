export type Entry = {
  name: string;
  path: string;
  isDirectory: boolean;
  children: Entry[] | null;
  createdAt: number;
  modifiedAt: number;
};

export type SearchResult = {
  path: string;
  name: string;
  score: number;
  matches: number[];
};

export type FontSize = "sm" | "md" | "lg";
