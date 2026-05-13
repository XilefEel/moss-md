import { useEffect, useState } from "react";
import { getIsDark, saveIsDark } from "../lib/storage";

export default function useTheme() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = async () => {
    const theme = !isDark;
    setIsDark(theme);
    await saveIsDark(theme);
    document.documentElement.classList.toggle("dark", theme);
  };

  useEffect(() => {
    const fetchTheme = async () => {
      const dark = await getIsDark();
      if (dark !== null) setIsDark(dark);
    };
    fetchTheme();
  }, []);

  return { isDark, toggleTheme };
}
