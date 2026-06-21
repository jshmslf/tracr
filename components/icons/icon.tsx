import { FontAwesomeIcon, type FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { cn } from "@/lib/utils";

export function Icon({ className, ...props }: FontAwesomeIconProps) {
  return <FontAwesomeIcon className={cn("size-4", className)} {...props} />;
}
