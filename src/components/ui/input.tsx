"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function CustomInput({ label, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label>{label}</label>
      <input
        {...props}
        className="border-2 rounded-md p-3 bg-white text-black"
      />
    </div>
  );
}
