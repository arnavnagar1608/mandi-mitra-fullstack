/**
 * Notification Service
 * Abstraction layer for SMS, WhatsApp, and Mail APIs.
 * 
 * To be replaced with actual implementations (Twilio, SendGrid, Meta Graph API)
 * when API keys are provided.
 */

async function sendSMS(phone, message) {
  // Placeholder for SMS API integration (e.g., Twilio, Fast2SMS)
  console.log(`[SMS MOCK] Sending to ${phone}: ${message}`);
  return { success: true, provider: 'mock' };
}

async function sendWhatsApp(phone, message) {
  // Placeholder for WhatsApp API integration (e.g., Twilio WhatsApp, Meta Graph)
  console.log(`[WhatsApp MOCK] Sending to ${phone}: ${message}`);
  return { success: true, provider: 'mock' };
}

async function sendEmail(to, subject, body) {
  // Placeholder for Email API integration (e.g., SendGrid, Nodemailer)
  console.log(`[Email MOCK] Sending to ${to} | Subject: ${subject}`);
  return { success: true, provider: 'mock' };
}

module.exports = {
  sendSMS,
  sendWhatsApp,
  sendEmail
};
