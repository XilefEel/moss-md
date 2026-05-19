import { dirname, join } from "@tauri-apps/api/path";
import { readDir } from "@tauri-apps/plugin-fs";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Entry } from "../stores/useFileTreeStore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const buildTree = async (dirPath: string): Promise<Entry[]> => {
  const entries = await readDir(dirPath);

  const result = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = await join(dirPath, entry.name);

      if (entry.isDirectory) {
        const children = await buildTree(entryPath);

        return {
          name: entry.name,
          path: entryPath,
          isDirectory: true,
          children,
        };
      } else if (entry.name.endsWith(".md")) {
        return {
          name: entry.name,
          path: entryPath,
          isDirectory: false,
          children: [],
        };
      }

      return null;
    }),
  );

  return result
    .filter((e) => e !== null)
    .sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return 0;
    }) as Entry[];
};

export const getAncestorPaths = async (
  path: string,
  rootPath: string,
): Promise<string[]> => {
  const ancestors: string[] = [];
  let current = await dirname(path);

  while (current !== rootPath) {
    ancestors.push(current);
    current = await dirname(current);
  }

  return ancestors;
};
