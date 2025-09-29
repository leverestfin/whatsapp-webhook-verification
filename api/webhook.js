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
async function getBody(req) {
  // If body already parsed (Next.js API / some environments)
  if (req.body && typeof req.body === "object") return req.body;

  // If it's a string, try JSON.parse
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }

  // Fallback: read raw stream
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8") || "";

  try { return raw ? JSON.parse(raw) : {}; } catch { return { _raw: raw }; }
}

export default async function handler(req, res) {
  if (req.method === "GET") {
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
    const body = await getBody(req);

    try {
      const changes = body?.entry?.[0]?.changes?.[0];
      const value = changes?.value;

      // 🔔 Delivery / read / failed updates
      if (Array.isArray(value?.statuses) && value.statuses.length > 0) {
        value.statuses.forEach((s) => {
          console.log("📩 Delivery status update:");
          console.log(`Message ID: ${s.id}`);
          console.log(`Recipient: ${s.recipient_id}`);
          console.log(`Status: ${s.status}`); // sent | delivered | read | failed
          if (s.timestamp) {
            console.log(`Time: ${new Date(Number(s.timestamp) * 1000).toISOString()}`);
          }
          if (s.errors) {
            console.log("Error details:", JSON.stringify(s.errors));
          }
        });
      }
      // 💬 Inbound messages or other events
      else if (Array.isArray(value?.messages) && value.messages.length > 0) {
        console.log("💬 Inbound / other message event:", JSON.stringify(value.messages, null, 2));
      }
      // 🧪 Nothing matched? Log diagnostics so we can see what's arriving
      else {
        console.log("🔎 No statuses/messages detected. Diagnostics:");
        console.log("Headers:", JSON.stringify(req.headers, null, 2));
        console.log("Body:", JSON.stringify(body, null, 2));
      }
    } catch (err) {
      console.error("❌ Error parsing webhook:", err);
      console.log("Raw body for investigation:", JSON.stringify(body, null, 2));
    }

    return res.status(200).send("EVENT_RECEIVED");
  }

  return res.status(405).send("Method Not Allowed");
}

