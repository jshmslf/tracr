import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { extensionToken } from "@/lib/db/schema";

export function hashSecret(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function generateExtensionToken(): string {
  return randomBytes(32).toString("hex");
}

export async function verifyExtensionToken(
  request: Request
): Promise<{ userId: string; tokenId: string } | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  const tokenHash = hashSecret(token);
  const rows = await db
    .select({ id: extensionToken.id, userId: extensionToken.userId })
    .from(extensionToken)
    .where(eq(extensionToken.tokenHash, tokenHash))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  await db
    .update(extensionToken)
    .set({ lastUsedAt: new Date() })
    .where(eq(extensionToken.id, row.id));

  return { userId: row.userId, tokenId: row.id };
}
