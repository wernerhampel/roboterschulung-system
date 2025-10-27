import crypto from 'crypto';
import QRCode from 'qrcode';

/**
 * Generate a secure validation hash for certificate
 * Uses SHA-256 with a combination of certificate data
 */
export function generateCertificateHash(data: {
  zertifikatNummer: string;
  teilnehmerId: string;
  schulungId: string;
  ausstellungsdatum: Date;
}): string {
  const input = [
    data.zertifikatNummer,
    data.teilnehmerId,
    data.schulungId,
    data.ausstellungsdatum.toISOString(),
    process.env.NEXTAUTH_SECRET || 'fallback-secret',
  ].join('|');

  return crypto
    .createHash('sha256')
    .update(input)
    .digest('hex');
}

/**
 * Generate certificate number in format: ROBTEC-YYYY-NNNNNN
 */
export function generateCertificateNumber(year?: number): string {
  const currentYear = year || new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `ROBTEC-${currentYear}-${randomNum}`;
}

/**
 * Generate QR code data URL for certificate validation
 */
export async function generateQRCode(hash: string): Promise<string> {
  const validationUrl = `${process.env.NEXTAUTH_URL?.replace('admin', 'verify') || 'https://robtec-verify.vercel.app'}/validate?hash=${hash}`;
  
  const qrCodeDataUrl = await QRCode.toDataURL(validationUrl, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 300,
    margin: 2,
  });

  return qrCodeDataUrl;
}

/**
 * Validate certificate hash
 */
export function validateCertificateHash(
  hash: string,
  data: {
    zertifikatNummer: string;
    teilnehmerId: string;
    schulungId: string;
    ausstellungsdatum: Date;
  }
): boolean {
  const expectedHash = generateCertificateHash(data);
  return hash === expectedHash;
}
