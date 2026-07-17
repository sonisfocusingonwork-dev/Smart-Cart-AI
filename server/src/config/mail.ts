import nodemailer from 'nodemailer';

// Configure transporter
// If SMTP credentials are provided, use them. Otherwise, fall back to console logging.
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }
  
  // Return null if not configured, we will log to console instead
  return null;
};

export const sendVerificationEmail = async (email: string, otp: string): Promise<boolean> => {
  const transporter = getTransporter();
  const subject = 'Xác nhận email của bạn';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-corners: 8px;">
      <h2 style="color: #F97316; text-align: center;">Xác nhận Email Smart Cart</h2>
      <p>Xin chào,</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản tại Smart Cart. Vui lòng sử dụng mã OTP dưới đây để xác nhận địa chỉ email của bạn:</p>
      <div style="background-color: #FFF7ED; border: 2px dashed #F97316; padding: 15px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #EA580C;">${otp}</span>
      </div>
      <p style="font-size: 12px; color: #64748B;">Mã OTP này có hiệu lực trong vòng 10 phút. Nếu bạn không yêu cầu đăng ký này, vui lòng bỏ qua email.</p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Smart Cart AI" <no-reply@smartcart.local>',
        to: email,
        subject,
        html
      });
      console.log(`[Email Sent] Verification OTP sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error(`[Email Error] Failed to send email to ${email}:`, error);
      // Fall back to console printing
    }
  }

  // Fallback console logging (development mode)
  console.log('\n======================================================');
  console.log(`[MOCK EMAIL SENT TO: ${email}]`);
  console.log(`Subject: ${subject}`);
  console.log(`OTP Code: ${otp}`);
  console.log('======================================================\n');
  return true;
};
