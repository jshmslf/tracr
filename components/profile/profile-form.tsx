"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { profileSchema } from "@/lib/validation";
import { updateProfile } from "@/app/(dashboard)/profile/actions";
import type { InferSelectModel } from "drizzle-orm";
import type { profile as profileTable } from "@/lib/db/schema";

type ProfileRow = InferSelectModel<typeof profileTable>;

export function ProfileForm({
  profile,
  email,
}: {
  profile: ProfileRow | null;
  email: string;
}) {
  const [pending, startTransition] = useTransition();
  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [notes, setNotes] = useState(profile?.notes ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const input = profileSchema.safeParse({ fullName, phone, notes });
    if (!input.success) {
      toast.error(input.error.issues[0]?.message ?? "Please check the form for errors.");
      return;
    }

    startTransition(async () => {
      try {
        await updateProfile(input.data);
        toast.success("Profile saved.");
      } catch {
        toast.error("Could not save profile.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Email</Label>
        <Input value={email} disabled />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
