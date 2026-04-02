// src/utils/webhooks.js

/**
 * Sends a webhook event to the N8N instance.
 * Fire and forget - doesn't await the response to avoid blocking the main thread.
 * 
 * @param {string} event - The event name e.g 'booking_started'
 * @param {object} data - Dynamic JSON data payload
 */
const callWebhook = async (event, data) => {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn(`[Webhook Logger] N8N_WEBHOOK_URL is not set. Skipping event: ${event}`);
    return;
  }

  // Fire and forget
  try {
    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event, data })
    }).catch(error => {
      console.error(`[Webhook Logger] Failed to send webhook for event '${event}':`, error.message);
    });
  } catch (error) {
    console.error(`[Webhook Logger] Error triggering webhook for '${event}':`, error.message);
  }
};

module.exports = { callWebhook };
