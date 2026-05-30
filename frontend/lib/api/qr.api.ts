import { client } from "./client";

export interface QRGenerateResult {
  token: string;
  gradeId: number;
}

export interface QRVerifyResult {
  gradeId: number;
}

export async function generateQRToken(
  gradeId: number
): Promise<QRGenerateResult | null> {
  try {
    return await client.post<QRGenerateResult>("/qr/generate", { gradeId });
  } catch (error) {
    console.error("generateQRToken error:", error);
    return null;
  }
}

export async function verifyQRToken(
  token: string
): Promise<QRVerifyResult | null> {
  try {
    return await client.get<QRVerifyResult>(
      `/qr/verify?token=${encodeURIComponent(token)}`
    );
  } catch (error) {
    if (!(error as any)?.silent) console.error("verifyQRToken error:", error);
    return null;
  }
}
