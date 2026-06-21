"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons/icon";
import { DeleteConfirmDialog } from "@/components/applications/delete-confirm-dialog";
import { deleteApplication } from "@/app/(dashboard)/applications/actions";

type ApplicationDeleteButtonProps = {
  applicationId: string;
  jobTitle: string;
  companyName: string;
};

export function ApplicationDeleteButton({
  applicationId,
  jobTitle,
  companyName,
}: ApplicationDeleteButtonProps) {
  const router = useRouter();

  return (
    <DeleteConfirmDialog
      trigger={
        <Button type="button" variant="outline">
          <Icon icon={faTrash} />
          Delete
        </Button>
      }
      title="Delete this application?"
      description={`This will permanently remove "${jobTitle}" at ${companyName}. This cannot be undone.`}
      onConfirm={async () => {
        await deleteApplication(applicationId);
        toast.success("Application deleted.");
        router.push("/applications");
        router.refresh();
      }}
    />
  );
}
