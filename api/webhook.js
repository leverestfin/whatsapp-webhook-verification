// /api/webhook.js
// Vercel Serverless Function to handle WhatsApp webhook verification + events
// Deploy this repo on Vercel. Set an Environment Variable: VERIFY_TOKEN
// Use the deployed URL as your Callback URL, e.g. https://<your-app>.vercel.app/api/webhook

module.exports = (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "change-me";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (req.method === "GET") {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send("Verification failed");
    }
  }

  if (req.method === "POST") {
    // WhatsApp events (messages, statuses) will arrive here as POST JSON
    // You can log or process them. Keep response fast (under 10s) and return 200.
    // Example: console.log(JSON.stringify(req.body, null, 2));
    return res.status(200).send("EVENT_RECEIVED");
  }

  return res.status(405).send("Method Not Allowed");
};

// api/webhook.js
export default function handler(req, res) {
  if (req.method === "GET") {
    // --- Initial verification for WhatsApp ---
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "change-me";
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send("Verification failed");
    }
  }

  if (req.method === "POST") {
    const body = req.body;

    // ✅ DELIVERY STATUS HANDLING
    try {
      const changes = body.entry?.[0]?.changes?.[0];
      const value = changes?.value;

      // When WhatsApp sends delivery/read updates, they appear in value.statuses
      if (value?.statuses) {
        value.statuses.forEach((status) => {
          console.log("📩 Delivery status update:");
          console.log(`Message ID: ${status.id}`);
          console.log(`Recipient: ${status.recipient_id}`);
          console.log(`Status: ${status.status}`); // sent | delivered | read | failed
          console.log(
            `Time: ${new Date(status.timestamp * 1000).toISOString()}`
          );

          // If failed, log error info if available
          if (status.errors) {
            console.log("Error details:", JSON.stringify(status.errors));
          }
        });
      } else {
        // Other webhook events (like new inbound messages)
        console.log("New message or other event:", JSON.stringify(body, null, 2));
      }
    } catch (e) {
      console.error("Error parsing webhook:", e, JSON.stringify(body));
    }

    return res.status(200).send("EVENT_RECEIVED");
  }

  // If WhatsApp sends something unexpected
  return res.status(405).send("Method Not Allowed");
}
