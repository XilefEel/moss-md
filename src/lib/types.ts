export type Entry = {
  name: string;
  path: string;
  isDirectory: boolean;
  children: Entry[] | null;
};
