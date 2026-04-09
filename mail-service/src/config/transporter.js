import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT || 2525);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === "true",
    auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
            ? {
                  user: process.env.SMTP_USER,
                  pass: process.env.SMTP_PASS,
              }
            : undefined,
});

export const SMTP_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS || 8000);
export const MAIL_FROM =
    process.env.SMTP_FROM || "no-reply@photo-prestiges.local";

export default transporter;
