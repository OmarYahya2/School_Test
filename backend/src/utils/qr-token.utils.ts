import crypto from "crypto";
import { env } from "../config/env";

const QR_SECRET = env.JWT_SECRET + ":qr-token-v1";

export interface QRTokenPayload {
  gradeId: number;
  iat: number;
  exp: number;
}

export function generateQRToken(gradeId: number, ttlDays = 365): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: QRTokenPayload = {
    gradeId,
    iat: now,
    exp: now + ttlDays * 86400,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", QR_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

export function verifyQRToken(token: string): QRTokenPayload | null {
  try {
    const dotIndex = token.lastIndexOf(".");
    if (dotIndex === -1) return null;

    const data = token.substring(0, dotIndex);
    const sig = token.substring(dotIndex + 1);

    const expectedSig = crypto
      .createHmac("sha256", QR_SECRET)
      .update(data)
      .digest("base64url");

    if (sig !== expectedSig) return null;

    const payload: QRTokenPayload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8")
    );

    if (
      typeof payload.gradeId !== "number" ||
      payload.gradeId < 1 ||
      payload.gradeId > 9
    )
      return null;

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}
