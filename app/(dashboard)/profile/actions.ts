"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profile, themeValues } from "@/lib/db/schema";
import { profileSchema } from "@/lib/validation";
import type { ThemePreference } from "@/lib/types";

export async function updateProfile(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  const data = profileSchema.parse(input);
  const userId = session.user.id;

  await db
    .insert(profile)
    .values({
      userId,
      fullName: data.fullName || null,
      phone: data.phone || null,
      notes: data.notes || null,
    })
    .onConflictDoUpdate({
      target: profile.userId,
      set: {
        fullName: data.fullName || null,
        phone: data.phone || null,
        notes: data.notes || null,
        updatedAt: new Date(),
      },
    });

  revalidatePath("/profile");
}

export async function setPassword(newPassword: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  await auth.api.setPassword({
    body: { newPassword },
    headers: await headers(),
  });
}

export async function updateTheme(theme: ThemePreference) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  const value = z.enum(themeValues).parse(theme);
  const userId = session.user.id;

  await db
    .insert(profile)
    .values({ userId, theme: value })
    .onConflictDoUpdate({
      target: profile.userId,
      set: { theme: value, updatedAt: new Date() },
    });
}
