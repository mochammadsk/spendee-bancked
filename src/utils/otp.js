const bcrypt = require('bcrypt');

async function generateOtp() {
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  } // create OTP (6 digit)

  const otpHash = await bcrypt.hash(otp, 10); // hash OTP
  const expires_at = new Date(Date.now() + 5 * 60 * 1000); // set expiration time (5 minutes)

  return { otp, otpHash, expires_at };
}

function checkOtp(lastRecord, cooldownSeconds = 60) {
  if (!lastRecord || !lastRecord.createdAt) return null;

  const now = new Date();
  const secondsSinceLast = (now - lastRecord.createdAt) / 1000;

  if (secondsSinceLast < cooldownSeconds) {
    const wait = Math.ceil(cooldownSeconds - secondsSinceLast);
    return { cooldown: true, wait };
  }

  return null;
}

function limitOtp(lastRecord, max = 3) {
  const count = lastRecord?.resend_count || 0;
  if (count >= max) {
    return { limited: true };
  }

  return { limited: false, count };
}

module.exports = { generateOtp, checkOtp, limitOtp };
