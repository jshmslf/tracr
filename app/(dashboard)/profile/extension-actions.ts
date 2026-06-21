"use server";

import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { extensionPairingCode, extensionToken } from "@/lib/db/schema";
import { hashSecret } from "@/lib/extension-auth";
import { generatePairingPhrase } from "@/lib/wordlist";

const PAIRING_CODE_TTL_MS = 10 * 60 * 1000;

async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  return session.user.id;
}

export async function generatePairingCode(): Promise<string> {
  const userId = await requireUserId();
  const phrase = generatePairingPhrase();

  await db.insert(extensionPairingCode).values({
    userId,
    phraseHash: hashSecret(phrase),
    expiresAt: new Date(Date.now() + PAIRING_CODE_TTL_MS),
  });

  return phrase;
}

export async function listConnectedDevices() {
  const userId = await requireUserId();

  return db
    .select({
      id: extensionToken.id,
      label: extensionToken.label,
      createdAt: extensionToken.createdAt,
      lastUsedAt: extensionToken.lastUsedAt,
    })
    .from(extensionToken)
    .where(eq(extensionToken.userId, userId));
}

export async function revokeDevice(tokenId: string) {
  const userId = await requireUserId();

  await db
    .delete(extensionToken)
    .where(and(eq(extensionToken.id, tokenId), eq(extensionToken.userId, userId)));

  revalidatePath("/profile");
}
