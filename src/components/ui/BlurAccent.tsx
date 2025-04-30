import React from "react";

interface BlurAccentProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  size?: number;
  colorClass?: string;
  blurSize?: string;
  hiddenBelowLg?: boolean;
}

const positions = {
  "top-left": "top-1/4 left-1/4",
  "top-right": "top-1/4 right-1/4",
  "bottom-left": "bottom-1/4 left-1/4",
  "bottom-right": "bottom-1/4 right-1/4",
};

export default function BlurAccent({
  position,
  size = 112,
  colorClass = "bg-blue-500/30 dark:bg-blue-700/30",
  blurSize = "blur-[6rem]",
  hiddenBelowLg = true,
}: BlurAccentProps) {
  return (
    <div
      className={[
        hiddenBelowLg && "hidden lg:block",
        positions[position],
        `absolute w-[${size}px] h-[${size}px] rounded-full`,
        colorClass,
        "-z-10",
        blurSize,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
