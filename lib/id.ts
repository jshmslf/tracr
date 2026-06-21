import { randomInt } from "node:crypto";

// Excludes ambiguous characters (0, 1, I, O) for readability.
const CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function randomBlock(length: number): string {
  let block = "";
  for (let i = 0; i < length; i++) {
    block += CHARSET[randomInt(CHARSET.length)];
  }
  return block;
}

export function generateApplicationId(sequence: number): string {
  const block1 = randomBlock(5);
  const block2 = randomBlock(5);
  const seq = String(sequence).padStart(3, "0");
  return `${block1}-${block2}-${seq}`;
}
