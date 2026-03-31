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
      className={`${selectClasses} bg-background3`}
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
    >
      <FaSearch style={{ color: "grey" }} />
    </Button>
  );
}
