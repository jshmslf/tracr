import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getProfile, hasPasswordAccount } from "@/lib/db/queries";
import { listConnectedDevices } from "@/app/(dashboard)/profile/extension-actions";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordForm } from "@/components/profile/password-form";
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";
import { ConnectExtensionDialog } from "@/components/profile/connect-extension-dialog";
import { ConnectedDevices } from "@/components/profile/connected-devices";
import { Separator } from "@/components/ui/separator";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const profile = await getProfile(session!.user.id);
  const hasPassword = await hasPasswordAccount(session!.user.id);
  const devices = await listConnectedDevices();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-8">
          <ProfileForm profile={profile} email={session!.user.email} />

          <Separator />

          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium">Password</h2>
            <PasswordForm hasPassword={hasPassword} />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex h-fit flex-col gap-4 rounded-lg border border-border p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-medium">Browser extension</h2>
              <ConnectExtensionDialog />
            </div>
            <ConnectedDevices devices={devices} />
          </div>

          <div className="flex h-fit flex-col gap-4 self-start rounded-lg border border-border p-6">
            <h2 className="text-lg font-medium">Delete account</h2>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account, profile, and all tracked applications. This cannot
              be undone.
            </p>
            <div>
              <DeleteAccountDialog hasPassword={hasPassword} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
