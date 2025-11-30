import bcrypt from 'bcrypt';

export type OtpRecordLike = {
  createdAt?: Date | string | number | null;
  resend_count?: number | null;
};

export type GeneratedOtp = {
  otp: string;
  otpHash: string;
  expiresAt: Date;
};

// Generate OTP
export async function generateOtp(): Promise<GeneratedOtp> {
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }

  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  return { otp, otpHash, expiresAt };
}

// Check cooldown OTP
export function cooldownOtp(
  lastRecord?: OtpRecordLike,
  cooldownSeconds = 60
): { cooldown: true; wait: number } | null {
  const createdAt = lastRecord?.createdAt;
  if (!createdAt) return null;

  const last =
    typeof createdAt === 'string' || typeof createdAt === 'number'
      ? new Date(createdAt)
      : createdAt;

  if (!(last instanceof Date) || isNaN(last.getTime())) return null;

  const now = new Date();
  const secondsSinceLast = (now.getTime() - last.getTime()) / 1000;

  if (secondsSinceLast < cooldownSeconds) {
    const wait = Math.ceil(cooldownSeconds - secondsSinceLast);
    return { cooldown: true, wait };
  }

  return null;
}

// Check limit OTP
export function limitOtp(
  lastRecord?: OtpRecordLike,
  max = 3
): { limited: true } | { limited: false; count: number } {
  const count = Math.max(0, Number(lastRecord?.resend_count ?? 0));
  if (count >= max) {
    return { limited: true };
  }
  return { limited: false, count };
}

export default { generateOtp, cooldownOtp, limitOtp };
