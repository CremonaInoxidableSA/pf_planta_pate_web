import React from "react";

export const formatDate = (raw: string): string => {
  try {
    return new Date(raw).toISOString().slice(0, 16).replace("T", " ");
  } catch {
    return raw || "";
  }
};

export const highlightText = (
  text: string,
  filter: string,
): React.ReactNode => {
  if (!filter) return text;
  try {
    const escaped = filter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === filter.toLowerCase() ? (
        <mark
          key={i}
          className="bg-yellow-400/40 text-texto font-bold rounded"
        >
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  } catch {
    return text;
  }
};
