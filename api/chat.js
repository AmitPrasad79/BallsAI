export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { message } = req.body;

  const response = await fetch("https://api.fireworks.ai/inference/v1/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.fw_3ZeaLJeQtbMzAk1cPZZmP1j3}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "accounts/fireworks/models/llama-v3p1-8b-instruct",
      prompt: `You are Balls AI, a witty, confident assistant created by Amit Prasad. Respond casually and intelligently.\n\nUser: ${message}\nBalls AI:`,
      max_tokens: 200
    })
  });

  const data = await response.json();
  res.status(200).json({ reply: data.choices[0]?.text.trim() || "No reply from model." });
}
