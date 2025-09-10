
'use server';

import twilio from 'twilio';

// Initialize Twilio client
// IMPORTANT: Replace with your actual Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// A client is created only if all credentials are provided.
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Sends an SMS message to a specified phone number.
 * @param to The recipient's phone number (e.g., '+15558675310').
 * @param body The content of the SMS message.
 */
export async function sendSms(to: string, body: string): Promise<void> {
  if (!client || !twilioPhoneNumber) {
    console.warn(
      'Twilio client is not configured. SMS will not be sent. Please check your environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER'
    );
    // In a development environment, you might just want to log the message
    console.log(`[SMS PREVIEW] To: ${to} | Body: ${body}`);
    return;
  }
  
  // Basic validation for the 'to' number
  if (!/^\+\d+$/.test(to)) {
      console.error(`Invalid 'to' phone number format: ${to}. It must be in E.164 format (e.g., +15558675310).`);
      return;
  }

  try {
    const message = await client.messages.create({
      body: body,
      from: twilioPhoneNumber,
      to: to,
    });
    console.log(`SMS sent successfully! SID: ${message.sid}`);
  } catch (error) {
    console.error('Failed to send SMS:', error);
    // Rethrowing the error allows the caller to handle it if needed,
    // but for notifications, you might want to fail silently.
    throw new Error('SMS sending failed.');
  }
}
