import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config({ quiet: true });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

export async function otpVerifyAccount(email: string, otp: string) {
  return transporter.sendMail({
    from: `"noreply" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
      <div
        style="
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 10px;
          background-color: #f9f9f9;
        "
      >
        <h2 style="text-align: center; color: #333">Email Verification</h2>
        <p style="color: #333">
          Use the following verification code to complete your registration:
        </p>
        <div style="text-align: center; margin: 20px 0">
          <span
            style="display: inline-block; font-size: 24px; letter-spacing: 4px"
          >
            ${otp}
          </span>
        </div>
        <p style="color: #333">This code will expire in 5 minutes.</p>
        <p style="color: #333">
          If you did not create an account, please ignore this email.
        </p>
        <p style="color: #333">
          Best regards,<br />
          <b>Spendee Team</b>
        </p>
      </div>
    </div>
    `,
  });
}

export async function otpForgotPassword(email: string, otp: string) {
  return transporter.sendMail({
    from: `"noreply" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Password Reset Code',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <div style="
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
            background-color: #f9f9f9;
        ">
          <h2 style="text-align: center; color: #333">Reset Your Password</h2>
          <p style="color: #333">
            Use the verification code below to reset your password:
          </p>

          <div style="text-align: center; margin: 20px 0">
            <span style="display: inline-block; font-size: 24px; letter-spacing: 4px">
              ${otp}
            </span>
          </div>

          <p style="color: #333">This code will expire in 5 minutes.</p>
          <p style="color: #333">
            If you did not request a password reset, please ignore this email.
          </p>

          <p style="color: #333">Best regards,<br /><b>Spendee Team</b></p>
        </div>
      </div>
    `,
  });
}
