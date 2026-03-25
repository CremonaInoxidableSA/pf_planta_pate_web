import { Button } from "@/components/ui/button";
import { FaSearch } from "react-icons/fa";

interface BotonAplicarProps {
  selectClasses?: string;
  onClick?: () => void;
}

export default function BotonAplicar({
  selectClasses,
  onClick,
}: BotonAplicarProps) {
  return (
    <Button
      className={`${selectClasses} min-w-12.5 min-h-12.5`}
      variant="ghost"
      onClick={onClick}
    >
      <FaSearch style={{ color: "grey" }} />
    </Button>
  );
}
