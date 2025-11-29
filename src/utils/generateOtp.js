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

module.exports = generateOtp;
