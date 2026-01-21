import QRCode from 'qrcode';

export async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 300,
  });
}

export async function generateMemberQRCode(
  token: string,
  baseUrl: string
): Promise<string> {
  const checkinUrl = `${baseUrl}/checkin/${token}`;
  return generateQRCode(checkinUrl);
}

export async function generateObjectiveQRCode(
  token: string,
  baseUrl: string
): Promise<string> {
  const scanUrl = `${baseUrl}/scan/${token}`;
  return generateQRCode(scanUrl);
}
