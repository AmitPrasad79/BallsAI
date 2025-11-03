// /api/chat.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST" });

  try {
    const { message, history = [], attachments = [] } = req.body;

    // Build a concise prompt: include last few turns from history (browser sends trimmed history)
    let convo = `System: You are Balls AI — a friendly, witty assistant created by Amit Prasad. Keep replies concise (3-6 short paragraphs or < 150 words). When asked for long content, offer a short answer and ask if user wants details.\n\n`;
    // Add attachments summary if present
    if (attachments.length) {
      const names = attachments.map(a => a.name).join(", ");
      convo += `User has attached files: ${names}.\n\n`;
    }

    // Add recent history (history is an array of {role: "user"|"assistant", text})
    const lastN = 6;
    const recent = history.slice(-lastN);
    recent.forEach(h => {
      convo += `${h.role === "user" ? "User" : "Balls AI"}: ${h.text}\n`;
    });

    convo += `User: ${message}\nBalls AI:`;

    const response = await fetch("https://api.fireworks.ai/inference/v1/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.FIREWORKS_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "accounts/fireworks/models/llama-v3p1-8b-instruct",
        prompt: convo,
        max_tokens: 140,          // keep replies shorter
        temperature: 0.7,
        top_p: 0.9
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.text?.trim() || "No reply.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
