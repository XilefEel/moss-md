import { Store } from "@tauri-apps/plugin-store";

let storePromise: Promise<Store> | null = null;

function getStore() {
  if (!storePromise) {
    storePromise = Store.load(".mindnest.json");
  }
  return storePromise;
}

export async function setItem<T>(key: string, value: T) {
  const store = await getStore();
  await store.set(key, value);
  await store.save();
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
