"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { setPassword } from "@/app/(dashboard)/profile/actions";

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      try {
        if (hasPassword) {
          const { error } = await authClient.changePassword({ currentPassword, newPassword });
          if (error) {
            toast.error(error.message ?? "Could not change password.");
            return;
          }
          toast.success("Password changed.");
          setCurrentPassword("");
        } else {
          await setPassword(newPassword);
          toast.success("Password set.");
          router.refresh();
        }
        setNewPassword("");
        setConfirmPassword("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not save password.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      {hasPassword && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="currentPassword">Current password</Label>
          <PasswordInput
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="newPassword">{hasPassword ? "New password" : "Password"}</Label>
        <PasswordInput
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">
          {hasPassword ? "Confirm new password" : "Confirm password"}
        </Label>
        <PasswordInput
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : hasPassword ? "Change password" : "Set password"}
      </Button>
    </form>
  );
}
