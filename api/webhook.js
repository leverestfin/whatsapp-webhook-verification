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
