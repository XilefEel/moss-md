import { dirname } from "@tauri-apps/api/path";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getAncestorPaths(
  path: string,
  rootPath: string,
): Promise<string[]> {
  const ancestors: string[] = [];
  let current = await dirname(path);

  while (current !== rootPath) {
    ancestors.push(current);
    current = await dirname(current);
  }

  return ancestors;
}
