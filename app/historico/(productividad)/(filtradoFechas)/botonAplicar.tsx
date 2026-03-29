import { Button } from "@/components/ui/button";
import { FaSearch } from "react-icons/fa";

interface BotonAplicarProps {
  selectClasses?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function BotonAplicar({
  selectClasses,
  onClick,
  disabled,
}: BotonAplicarProps) {
  return (
    <Button
      className={`${selectClasses} min-w-12.5 min-h-12.5 bg-background3`}
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
    >
      <FaSearch style={{ color: "grey" }} />
    </Button>
  );
}
