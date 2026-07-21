type Value = string | number | null | boolean;

export const getColorClass = (
  key: string,
  value: Value,
  defaultColor: "orange" | "blue" | "lightRed",
): string => {
  if (value === "N/A") {
    return "text-texto !important";
  }

  if (value === false) {
    return "text-red !important";
  }

  if (value === true) {
    return "text-green !important";
  }

  if (key === "tempIngreso") {
    return "text-ingresoTemp !important";
  }

  if (key === "tempAgua") {
    return "text-waterTemp !important";
  }

  if (key === "nivelAgua") {
    return "text-waterLevel !important";
  }

  return defaultColor === "orange"
    ? "text-orange !important"
    : defaultColor === "blue"
      ? "text-blue !important"
      : "text-lightRed !important";
};
