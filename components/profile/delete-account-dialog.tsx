"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const CONFIRM_PHRASE = "I confirm";

export function DeleteAccountDialog({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [pending, setPending] = useState(false);

  function resetState() {
    setPassword("");
    setConfirmText("");
    setPending(false);
  }

  async function handleConfirm() {
    setPending(true);

    const { error } = await authClient.deleteUser({
      password: hasPassword ? password : undefined,
    });

    setPending(false);

    if (error) {
      if (error.code === "SESSION_EXPIRED") {
        toast.error("Please sign out and sign back in, then try deleting your account again.");
      } else {
        toast.error(error.message ?? "Could not delete account.");
      }
      return;
    }

    toast.success("Account deleted.");
    router.push("/login");
    router.refresh();
  }

  const confirmed = confirmText === CONFIRM_PHRASE;

  return (
    <AlertDialog onOpenChange={(open) => !open && resetState()}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive">
          Delete account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes your account, profile, and all tracked applications. This
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {hasPassword && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="deleteAccountPassword">Current password</Label>
            <PasswordInput
              id="deleteAccountPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="deleteAccountConfirm">
            Type{" "}
            <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm font-medium text-foreground">
              {CONFIRM_PHRASE}
            </span>{" "}
            to confirm
          </Label>
          <Input
            id="deleteAccountConfirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            required
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={pending || !confirmed || (hasPassword && !password)}
          >
            {pending ? "Deleting..." : "Delete account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
