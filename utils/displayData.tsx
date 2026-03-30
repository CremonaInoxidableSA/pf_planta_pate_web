type Data = string | number | boolean | null;

export const displayData = (
  data: Data,
  unit?: string,
): string | number | boolean => {
  if (data === "N/A" || data === null) return "N/A";
  if (typeof data === "boolean") return data ? "True" : "False";

  let formatted = data;
  if (typeof data === "number") {
    formatted = data.toFixed(2).replace(/\.00$/, "");
  }

  return unit ? `${formatted} ${unit}` : formatted;
};
