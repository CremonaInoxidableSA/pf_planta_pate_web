import { Button } from "@/components/ui/button";
import { FaSearch } from "react-icons/fa";

interface BotonAplicarProps {
  selectClasses?: string;
  startDate: string | null;
  endDate: string | null;
  lineaId: number;
  equipoId: number;
  dato_enviado?: number;
  onApplyFilters: (data: {
    startDate: string | null;
    endDate: string | null;
    lineaId: number;
    equipoId: number;
    dato_enviado?: number;
  }) => void;
}

export default function BotonAplicar({
  selectClasses,
  startDate,
  endDate,
  lineaId,
  equipoId,
  dato_enviado,
  onApplyFilters,
}: BotonAplicarProps) {
  const isDisabled = !startDate || !endDate;

  const handleClick = () => {
    onApplyFilters({
      startDate,
      endDate,
      lineaId,
      equipoId,
      dato_enviado,
    });
  };

  return (
    <Button
      className={`${selectClasses} min-w-[40px] ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={isDisabled}
      variant="ghost"
      onClick={handleClick}
    >
      <FaSearch style={{ color: isDisabled ? "#999" : "grey" }} />
    </Button>
  );
}
