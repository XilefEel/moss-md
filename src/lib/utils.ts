import { dirname } from "@tauri-apps/api/path";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export function formatDate(ms?: number | null) {
  if (ms == null || Number.isNaN(ms)) return "Unknown";

  const date = new Date(ms);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
