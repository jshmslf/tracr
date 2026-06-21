import {
  faBookmark,
  faPaperPlane,
  faComments,
  faCheck,
  faXmark,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons/icon";
import { statusLabels, type ApplicationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusIcons: Record<ApplicationStatus, IconDefinition> = {
  saved: faBookmark,
  applied: faPaperPlane,
  interviewing: faComments,
  offer: faCheck,
  rejected: faXmark,
  withdrawn: faBan,
};

const statusClasses: Record<ApplicationStatus, string> = {
  saved: "bg-secondary text-secondary-foreground",
  applied: "bg-primary/10 text-primary",
  interviewing: "bg-primary/15 text-primary",
  offer: "bg-foreground text-background",
  rejected: "bg-destructive/10 text-destructive",
  withdrawn: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 border-transparent", statusClasses[status])}>
      <Icon icon={statusIcons[status]} className="size-3" />
      {statusLabels[status]}
    </Badge>
  );
}
