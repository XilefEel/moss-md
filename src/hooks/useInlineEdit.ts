import { useEffect, useRef, useState } from "react";

export function useInlineEdit({
  initialValue,
  onSave,
}: {
  initialValue: string;
  onSave: (value: string) => Promise<void> | void;
}) {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const shouldSaveRef = useRef(true);

  const handleBlur = async () => {
    setIsEditing(false);
    window.getSelection()?.removeAllRanges();

    if (!shouldSaveRef.current) {
      shouldSaveRef.current = true;
      return;
    }

    if (value.trim() === "") {
      setValue(initialValue);
      return;
    }

    if (value !== initialValue) {
      await onSave(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      shouldSaveRef.current = true;
      e.currentTarget.blur();
    }

    if (e.key === "Escape") {
      shouldSaveRef.current = false;
      setValue(initialValue);
      e.currentTarget.blur();
    }
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return {
    value,
    setValue,
    isEditing,
    setIsEditing,
    handleBlur,
    handleKeyDown,
  };
}
