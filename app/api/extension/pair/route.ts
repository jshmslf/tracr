import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { format } from "date-fns";
import { z } from "zod";
import { db } from "@/lib/db";
import { extensionPairingCode, extensionToken } from "@/lib/db/schema";
import { generateExtensionToken, hashSecret } from "@/lib/extension-auth";

const pairSchema = z.object({ phrase: z.string().trim().min(1) });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = pairSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const phraseHash = hashSecret(parsed.data.phrase);

  const rows = await db
    .select()
    .from(extensionPairingCode)
    .where(
      and(
        eq(extensionPairingCode.phraseHash, phraseHash),
        isNull(extensionPairingCode.consumedAt),
        gt(extensionPairingCode.expiresAt, new Date())
      )
    )
    .limit(1);

  const pairingCode = rows[0];
  if (!pairingCode) {
    return NextResponse.json({ error: "Invalid or expired pairing phrase" }, { status: 400 });
  }

  await db
    .update(extensionPairingCode)
    .set({ consumedAt: new Date() })
    .where(eq(extensionPairingCode.id, pairingCode.id));

  const token = generateExtensionToken();

  await db.insert(extensionToken).values({
    userId: pairingCode.userId,
    tokenHash: hashSecret(token),
    label: `Chrome, connected ${format(new Date(), "MMM d, yyyy")}`,
  });

  return NextResponse.json({ token });
}
