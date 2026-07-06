import { Store } from "@tauri-apps/plugin-store";

let storePromise: Promise<Store> | null = null;

function getStore() {
  if (!storePromise) {
    storePromise = Store.load(".mossmd.json");
  }
  return storePromise;
}

export async function setItem<T>(key: string, value: T) {
  const store = await getStore();
  await Promise.all([store.set(key, value), store.save()]);
}

export async function getItem<T>(key: string): Promise<T | null> {
  const store = await getStore();
  return (await store.get<T>(key)) ?? null;
}

export async function saveIsDark(isDark: boolean) {
  return setItem("isDark", isDark);
}

export async function getIsDark(): Promise<boolean | null> {
  return getItem<boolean>("isDark");
}

export async function getLastFilePath(): Promise<string | null> {
  return getItem<string>("lastFilePath");
}

export async function saveLastFilePath(path: string) {
  return setItem("lastFilePath", path);
}

export async function getLastDir(): Promise<string | null> {
  return getItem<string>("lastDir");
}

export async function saveLastDir(path: string) {
  return setItem("lastDir", path);
}

export async function getIsSidebarOpen(): Promise<boolean | null> {
  return getItem<boolean>("isSidebarOpen");
}

export async function saveIsSidebarOpen(val: boolean) {
  return setItem("isSidebarOpen", val);
}

export async function getIsRightbarOpen(): Promise<boolean | null> {
  return getItem<boolean>("isRightbarOpen");
}

export async function saveIsRightbarOpen(val: boolean) {
  return setItem("isRightbarOpen", val);
}

export async function getViewMode(): Promise<"view" | "edit" | null> {
  return getItem<"view" | "edit">("viewMode");
}

export async function saveViewMode(val: string) {
  return setItem("viewMode", val);
}
