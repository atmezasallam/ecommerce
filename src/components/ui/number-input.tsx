"use client";

import React, { useEffect, useMemo, useState } from "react";

export type NumberInputProps = {
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;

  // Some forms use `onChange`, others use `onValueChange`.
  onChange?: (value: number) => void;
  onValueChange?: (value: number) => void;
};

export default function NumberInput({
  defaultValue,
  min,
  max,
  step,
  placeholder,
  className,
  onChange,
  onValueChange,
}: NumberInputProps) {
  const [value, setValue] = useState<string>(
    typeof defaultValue === "number" ? String(defaultValue) : ""
  );

  const emit = useMemo(() => onValueChange ?? onChange, [onValueChange, onChange]);

  useEffect(() => {
    setValue(typeof defaultValue === "number" ? String(defaultValue) : "");
  }, [defaultValue]);

  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      className={className}
      onChange={(e) => {
        const next = e.target.value;
        setValue(next);

        if (!emit) return;

        // Keep it simple: if empty, treat as 0.
        if (next.trim() === "") {
          emit(0);
          return;
        }

        const num = Number(next);
        if (!Number.isNaN(num)) emit(num);
      }}
    />
  );
}

