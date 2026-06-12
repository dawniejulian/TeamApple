const nodemailer = require('nodemailer');

function getWebBaseUrl() {
  const raw = process.env.PUBLIC_APP_URL || process.env.FRONTEND_URL || 'http://localhost:3001';
  return raw.replace(/\/$/, '');
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

async function sendCustomerVerificationEmail({ to, name, token }) {
  const baseUrl = getWebBaseUrl();
  const verificationUrl = `${baseUrl}/teamapple/account.html?verify=${encodeURIComponent(token)}`;

  const transporter = createTransport();

  if (!transporter) {
    return {
      delivered: false,
      verificationUrl,
      message: 'SMTP belum dikonfigurasi, link verifikasi disiapkan dalam mode development.'
    };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'Verifikasi Akun Customer TeamApple',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
        <h2>Halo ${name || 'Customer'},</h2>
        <p>Terima kasih sudah membuat akun di TeamApple.</p>
        <p>Klik tombol di bawah untuk verifikasi akun Anda:</p>
        <p>
          <a href="${verificationUrl}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;">
            Verifikasi Akun
          </a>
        </p>
        <p>Jika tombol tidak berfungsi, buka link ini secara manual:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>Link berlaku selama 24 jam.</p>
      </div>
    `
  });

  return {
    delivered: true,
    verificationUrl,
    message: 'Email verifikasi berhasil dikirim.'
  };
}

module.exports = {
  sendCustomerVerificationEmail
};
