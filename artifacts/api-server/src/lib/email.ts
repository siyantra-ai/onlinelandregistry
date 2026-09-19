import nodemailer from "nodemailer";
import { logger } from "./logger";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM || "Online Land Registry <sales@onlinelandregistry.uk>";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
const smtpSecure = process.env.SMTP_SECURE === "true";
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || "Online Land Registry <noreply@onlinelandregistry.com>";

let transporter: nodemailer.Transporter | null = null;

if (resendApiKey) {
  logger.info("Resend email service initialized");
} else if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
  logger.info({ host: smtpHost, user: smtpUser }, "SMTP Mail transporter initialized");
} else {
  logger.warn("Neither Resend nor SMTP mail environment variables are fully configured. Email notifications will run in simulation/logging fallback mode.");
}

export interface OrderEmailDetails {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  serviceName: string;
  totalAmount: number;
  propertyCount: number;
  country: string;
  propertyAddress?: string | null;
  turnaround?: string | null;
  deliverables?: string | null;
}

export async function sendBookingConfirmationEmail(details: OrderEmailDetails): Promise<void> {
  const {
    customerName,
    customerEmail,
    orderNumber,
    serviceName,
    totalAmount,
    propertyCount,
    country,
    propertyAddress,
    deliverables = "",
  } = details;

  const turnaroundText = details.turnaround || "From 1 hour";

  const formattedAmount = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(totalAmount);

  const countryText = country === "scotland" ? "Scotland" : "England & Wales";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - ${orderNumber}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
    }
    .header {
      background-color: #111827;
      padding: 32px;
      text-align: center;
      border-bottom: 4px solid #d97706;
    }
    .header h1 {
      color: #ffffff;
      font-size: 24px;
      margin: 0;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 32px;
    }
    .greeting {
      font-size: 18px;
      line-height: 28px;
      font-weight: 600;
      color: #1e293b;
      margin-top: 0;
    }
    .intro {
      font-size: 15px;
      line-height: 24px;
      color: #475569;
      margin-bottom: 24px;
    }
    .order-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .order-card h2 {
      font-size: 16px;
      font-weight: 700;
      color: #111827;
      margin-top: 0;
      margin-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 10px;
    }
    .detail-row {
      display: block;
      margin-bottom: 12px;
      font-size: 14px;
      line-height: 20px;
    }
    .detail-row::after {
      content: "";
      display: table;
      clear: both;
    }
    .detail-label {
      color: #64748b;
      font-weight: 500;
      float: left;
    }
    .detail-value {
      color: #0f172a;
      font-weight: 600;
      float: right;
      text-align: right;
    }
    .next-steps {
      margin-top: 24px;
      border-top: 1px solid #e2e8f0;
      padding-top: 24px;
    }
    .next-steps h3 {
      font-size: 15px;
      font-weight: 700;
      color: #111827;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .step-item {
      margin-bottom: 16px;
      font-size: 14px;
      line-height: 20px;
      color: #475569;
    }
    .step-number {
      background-color: #d97706;
      color: #ffffff;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: inline-block;
      text-align: center;
      font-size: 12px;
      line-height: 22px;
      font-weight: 700;
      margin-right: 10px;
      vertical-align: middle;
    }
    .step-text {
      display: inline-block;
      width: calc(100% - 36px);
      vertical-align: top;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      line-height: 18px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 0 0 8px 0;
    }
    .footer p:last-child {
      margin-bottom: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Booking Confirmation</h1>
      </div>
      <div class="content">
        <p class="greeting">Hello ${customerName},</p>
        <p class="intro">
          Thank you for choosing Online Land Registry. Your booking has been successfully placed, and your payment was processed. Below are the details of your order.
        </p>

        <div class="order-card">
          <h2>Order Reference: ${orderNumber}</h2>
          
          <div class="detail-row">
            <span class="detail-label">Service</span>
            <span class="detail-value">${serviceName}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Property Count</span>
            <span class="detail-value">${propertyCount}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Country Jurisdiction</span>
            <span class="detail-value">${countryText}</span>
          </div>

          ${propertyAddress ? `
          <div class="detail-row">
            <span class="detail-label">Property Address</span>
            <span class="detail-value">${propertyAddress}</span>
          </div>
          ` : ''}

          <div class="detail-row">
            <span class="detail-label">Estimated Turnaround</span>
            <span class="detail-value" style="color: #d97706;">${turnaroundText}</span>
          </div>

          <div class="detail-row" style="margin-top: 16px; border-top: 1px dashed #e2e8f0; padding-top: 12px; margin-bottom: 0;">
            <span class="detail-label" style="font-size: 15px; color: #111827; font-weight: 700;">Amount Paid</span>
            <span class="detail-value" style="font-size: 16px; color: #111827; font-weight: 700;">${formattedAmount}</span>
          </div>
        </div>

        <div class="next-steps">
          <h3>What happens next?</h3>
          <div class="step-item">
            <span class="step-number">1</span>
            <span class="step-text">We will process your order and obtain the officially registered files directly from the relevant land registry registry. This usually takes around <strong>${turnaroundText.toLowerCase()}</strong>.</span>
          </div>
          <div class="step-item">
            <span class="step-number">2</span>
            <span class="step-text">Once ready, we will deliver the documents directly to your email address (<strong>${customerEmail}</strong>).</span>
          </div>
          <div class="step-item">
            <span class="step-number">3</span>
            <span class="step-text">If any clarification or additional documents are needed, our support team will reach out to you immediately.</span>
          </div>
        </div>

        <p class="intro" style="margin-top: 24px; margin-bottom: 0;">
          If you have any questions or need to modify your booking details, please reply directly to this email or contact our support team.
        </p>
      </div>
      <div class="footer">
        <p><strong>Online Land Registry</strong></p>
        <p>This is an automated confirmation email for your booking.</p>
        <p>&copy; ${new Date().getFullYear()} Online Land Registry. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Hello ${customerName},

Thank you for choosing Online Land Registry! Your booking has been successfully placed, and your payment was processed.

Order Reference: ${orderNumber}
--------------------------------------------------
Service: ${serviceName}
Property Count: ${propertyCount}
Country Jurisdiction: ${countryText}
${propertyAddress ? `Property Address: ${propertyAddress}\n` : ""}Estimated Turnaround: ${turnaroundText}
Amount Paid: ${formattedAmount}
--------------------------------------------------

What happens next?
1. We will process your order and retrieve the officially registered files directly from the land registry. This typically takes ${turnaroundText.toLowerCase()}.
2. Once ready, the files will be delivered straight to your email address: ${customerEmail}.
3. If we require any clarification, we will contact you immediately.

If you have any questions, please reply directly to this email.

Best regards,
Online Land Registry Team
  `;

  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [customerEmail],
          subject: `Booking Confirmation - ${orderNumber}`,
          html: htmlContent,
          text: textContent,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Resend API returned status ${response.status}: ${errText}`);
      }

      const resData = await response.json() as { id: string };
      logger.info({ messageId: resData.id, to: customerEmail, orderNumber }, "Booking confirmation email sent successfully via Resend");
      return;
    } catch (error) {
      logger.error({ error, to: customerEmail, orderNumber }, "Failed to send booking confirmation email via Resend");
      throw error;
    }
  }

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: smtpFrom,
        to: customerEmail,
        subject: `Booking Confirmation - ${orderNumber}`,
        text: textContent,
        html: htmlContent,
      });
      logger.info({ messageId: info.messageId, to: customerEmail, orderNumber }, "Booking confirmation email sent successfully via SMTP");
      return;
    } catch (error) {
      logger.error({ error, to: customerEmail, orderNumber }, "Failed to send booking confirmation email via SMTP");
      throw error;
    }
  }

  logger.warn({
    to: customerEmail,
    subject: `Booking Confirmation - ${orderNumber}`,
    orderNumber,
  }, "Neither Resend nor SMTP mail credentials configured. Logging booking confirmation email content to console/logs.");

  console.log("=========================================");
  console.log(`EMAIL SIMULATION (TO: ${customerEmail})`);
  console.log(`SUBJECT: Booking Confirmation - ${orderNumber}`);
  console.log("-----------------------------------------");
  console.log(textContent.trim());
  console.log("=========================================");
}
