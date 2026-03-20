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
      className={`${selectClasses} min-w-[50px] min-h-[50px]`}
      variant="ghost"
      onClick={onClick}
    >
      <FaSearch style={{ color: "grey" }} />
    </Button>
  );
}
