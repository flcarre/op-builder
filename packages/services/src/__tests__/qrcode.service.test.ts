import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateQRCode,
  generateMemberQRCode,
  generateObjectiveQRCode,
} from '../qrcode.service';

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(),
  },
}));

describe('QRCode Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateQRCode', () => {
    it('should generate QR code from data string', async () => {
      const { default: QRCode } = await import('qrcode');
      const mockDataURL = 'data:image/png;base64,mock-qr-code';

      vi.mocked(QRCode.toDataURL).mockResolvedValue(mockDataURL);

      const result = await generateQRCode('test-data');

      expect(QRCode.toDataURL).toHaveBeenCalledWith('test-data', {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 300,
      });
      expect(result).toBe(mockDataURL);
    });

    it('should use correct QR code options', async () => {
      const { default: QRCode } = await import('qrcode');

      vi.mocked(QRCode.toDataURL).mockResolvedValue('data:image/png;base64,test');

      await generateQRCode('https://example.com');

      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 300,
        })
      );
    });
  });

  describe('generateMemberQRCode', () => {
    it('should generate QR code with check-in URL', async () => {
      const { default: QRCode } = await import('qrcode');
      const mockDataURL = 'data:image/png;base64,member-qr';

      vi.mocked(QRCode.toDataURL).mockResolvedValue(mockDataURL);

      const token = 'member-token-123';
      const baseUrl = 'https://example.com';
      const result = await generateMemberQRCode(token, baseUrl);

      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        'https://example.com/checkin/member-token-123',
        expect.any(Object)
      );
      expect(result).toBe(mockDataURL);
    });

    it('should construct correct check-in URL', async () => {
      const { default: QRCode } = await import('qrcode');

      vi.mocked(QRCode.toDataURL).mockResolvedValue('data:image/png;base64,test');

      await generateMemberQRCode('abc-123', 'http://localhost:3000');

      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        'http://localhost:3000/checkin/abc-123',
        expect.any(Object)
      );
    });
  });

  describe('generateObjectiveQRCode', () => {
    it('should generate QR code with scan URL', async () => {
      const { default: QRCode } = await import('qrcode');
      const mockDataURL = 'data:image/png;base64,objective-qr';

      vi.mocked(QRCode.toDataURL).mockResolvedValue(mockDataURL);

      const token = 'objective-token-456';
      const baseUrl = 'https://example.com';
      const result = await generateObjectiveQRCode(token, baseUrl);

      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        'https://example.com/scan/objective-token-456',
        expect.any(Object)
      );
      expect(result).toBe(mockDataURL);
    });

    it('should construct correct scan URL', async () => {
      const { default: QRCode } = await import('qrcode');

      vi.mocked(QRCode.toDataURL).mockResolvedValue('data:image/png;base64,test');

      await generateObjectiveQRCode('xyz-789', 'http://localhost:3000');

      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        'http://localhost:3000/scan/xyz-789',
        expect.any(Object)
      );
    });
  });
});
