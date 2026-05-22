import nodemailer from 'nodemailer';
import { prisma } from "./lib/prisma.js";
import { pool } from "./lib/db.js";

let transporter: nodemailer.Transporter | null = null;

export async function getTransporter() {
  if (transporter) return transporter;
  
  const smtpConfigSetting = await prisma.setting.findUnique({ where: { key: 'SMTP_CONFIG' } });
  if (!smtpConfigSetting || !smtpConfigSetting.value) {
    console.warn("SMTP config not found in DB settings.");
    return null;
  }
  
  try {
    const config = JSON.parse(smtpConfigSetting.value);
    transporter = nodemailer.createTransport({
      host: config.host,
      port: Number(config.port) || 587,
      secure: String(config.secure) === 'true',
      auth: {
        user: config.user,
        pass: config.pass,
      }
    });
    return transporter;
  } catch (error) {
    console.error("Error creating nodemailer transport:", error);
    return null;
  }
}

export async function sendEmail(to: string, subject: string, htmlContent: string) {
  const t = await getTransporter();
  const smtpConfigSetting = await prisma.setting.findUnique({ where: { key: 'SMTP_CONFIG' } });
  let from = 'no-reply@example.com';
  if (smtpConfigSetting) {
    try {
      const config = JSON.parse(smtpConfigSetting.value);
      from = config.from || config.user || from;
    } catch(e){}
  }

  // Get email footer from DB
  const designSetting = await prisma.setting.findUnique({ where: { key: 'EMAIL_DESIGN' } });
  let footer = '<br/><br/>---<br/>Regards,<br/>Nesrina 369 Consultancy';
  if (designSetting && designSetting.value) {
    try {
      const design = JSON.parse(designSetting.value);
      if (design.footer) {
        footer = `<br/><br/>${design.footer}`;
      }
    } catch(e){}
  }

  const finalHtml = `${htmlContent}${footer}`;

  if (!t) {
    console.log(`[SIMULATED EMAIL] To: ${to}\nSubject: ${subject}\nContent: ${finalHtml}`);
    return true; // Simulate if no SMTP
  }

  try {
    await t.sendMail({
      from,
      to,
      subject,
      html: finalHtml
    });
    return true;
  } catch(error) {
    console.error("Error sending email:", error);
    return false;
  }
}
