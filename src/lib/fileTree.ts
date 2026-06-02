import { Entry } from "./types";

export const sortEntries = (entries: Entry[]): Entry[] => {
  return entries.toSorted((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
};

export const insertIntoTree = (
  entries: Entry[],
  rootDir: string,
  dirPath: string,
  newEntry: Entry,
): Entry[] => {
  if (dirPath === rootDir) {
    return sortEntries([...entries, newEntry]);
  }

  return entries.map((e) => {
    if (e.path === dirPath) {
      return { ...e, children: sortEntries([...(e.children ?? []), newEntry]) };
    }
    if (e.isDirectory && dirPath.startsWith(e.path) && e.children) {
      return {
        ...e,
        children: insertIntoTree(e.children, rootDir, dirPath, newEntry),
      };
    }
    return e;
  });
};

export const updateChildrenPaths = (
  entries: Entry[],
  oldPrefix: string,
  newPrefix: string,
): Entry[] => {
  return entries.map((e) => {
    if (!e.path.startsWith(oldPrefix)) return e;

    const newPath = e.path.replace(oldPrefix, newPrefix);
    return {
      ...e,
      path: newPath,
      children: e.children
        ? updateChildrenPaths(e.children, oldPrefix, newPrefix)
        : e.children,
    };
  });
};

export const renameInTree = (
  entries: Entry[],
  oldPath: string,
  newPath: string,
  newName: string,
): Entry[] => {
  return entries.map((e) => {
    if (e.path === oldPath) {
      return {
        ...e,
        name: newName,
        path: newPath,
        children: e.children
          ? updateChildrenPaths(e.children, oldPath, newPath)
          : e.children,
      };
    }

    if (e.isDirectory && oldPath.startsWith(e.path) && e.children) {
      return {
        ...e,
        children: sortEntries(
          renameInTree(e.children, oldPath, newPath, newName),
        ),
      };
    }
    return e;
  });
};

export const removeFromTree = (entries: Entry[], path: string): Entry[] => {
  const result: Entry[] = [];

  for (const e of entries) {
    if (e.path === path) continue;

    result.push(
      e.isDirectory && path.startsWith(e.path) && e.children
        ? { ...e, children: removeFromTree(e.children, path) }
        : e,
    );
  }

  return result;
};

export const buildPathSet = (entries: Entry[]): Set<string> => {
  const paths = new Set<string>();
  const stack: Entry[] = [...entries];

  // DFS
  while (stack.length) {
    const entry = stack.pop()!;
    paths.add(entry.path);
    if (entry.children) stack.push(...entry.children);
  }

  return paths;
};
