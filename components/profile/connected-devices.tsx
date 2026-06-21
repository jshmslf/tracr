"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { faLaptop } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/applications/delete-confirm-dialog";
import { revokeDevice } from "@/app/(dashboard)/profile/extension-actions";
import { formatDate } from "@/lib/format";

type Device = {
  id: string;
  label: string;
  createdAt: Date;
  lastUsedAt: Date | null;
};

export function ConnectedDevices({ devices }: { devices: Device[] }) {
  const router = useRouter();

  if (devices.length === 0) {
    return <p className="text-sm text-muted-foreground">No devices connected yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {devices.map((device) => (
        <li
          key={device.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
        >
          <div className="flex items-center gap-3">
            <Icon icon={faLaptop} className="text-muted-foreground" />
            <div className="text-sm">
              <p className="font-medium">{device.label}</p>
              <p className="text-muted-foreground">
                Connected {formatDate(device.createdAt)} &middot; Last used{" "}
                {formatDate(device.lastUsedAt) ?? "Never"}
              </p>
            </div>
          </div>
          <DeleteConfirmDialog
            trigger={
              <Button type="button" variant="outline" size="sm">
                Revoke
              </Button>
            }
            title="Revoke this device?"
            description={`"${device.label}" will no longer be able to add applications to your account.`}
            onConfirm={async () => {
              await revokeDevice(device.id);
              toast.success("Device revoked.");
              router.refresh();
            }}
          />
        </li>
      ))}
    </ul>
  );
}
