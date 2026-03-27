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
    return "text-yellowGraph !important";
  }

  if (key === "tempAgua") {
    return "text-water !important";
  }

  if (key === "tempIng") {
    return "text-greenGraph !important";
  }

  if (key === "tempProd") {
    return "text-greengraph !important";
  }

  if (key === "nivelAgua") {
    return "text-water !important";
  }

  return defaultColor === "orange"
    ? "text-orange !important"
    : defaultColor === "blue"
      ? "text-blue !important"
      : "text-lightRed !important";
};
