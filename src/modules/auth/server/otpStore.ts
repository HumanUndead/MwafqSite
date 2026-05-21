import 'server-only';

type OtpRecord = {
  code: string;
  expiresAt: number;
};

const OTP_TTL_MS = 10 * 60 * 1000;

const globalStore = globalThis as typeof globalThis & {
  __mwafqOtpStore?: Map<string, OtpRecord>;
};

const otpStore = globalStore.__mwafqOtpStore ?? new Map<string, OtpRecord>();

globalStore.__mwafqOtpStore = otpStore;

function buildOtpKey(email: string) {
  return email.trim().toLowerCase();
}

export function createEmailOtp(code: string, email: string) {
  const key = buildOtpKey(email);
  otpStore.set(key, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
}

export function consumeEmailOtp(email: string, code: string) {
  const key = buildOtpKey(email);
  const record = otpStore.get(key);

  if (!record) {
    return false;
  }

  if (record.expiresAt <= Date.now()) {
    otpStore.delete(key);
    return false;
  }

  if (record.code !== code) {
    return false;
  }

  otpStore.delete(key);
  return true;
}
