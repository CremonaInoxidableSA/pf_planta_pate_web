type Data = string | number | boolean | null;

export const displayData = (
  data: Data,
  unit?: string,
): string | number | boolean => {
  if (data === "N/A" || data === null) return "N/A";
  if (typeof data === "boolean") return data ? "True" : "False";

  return unit ? `${data} ${unit}` : data;
};
