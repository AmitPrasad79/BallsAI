import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const FIREWORKS_API_KEY = "fw_3ZeaLJeQtbMzAk1cPZZmP1j3";

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  const response = await fetch("https://api.fireworks.ai/inference/v1/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${FIREWORKS_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "dobby-70b",
      prompt: message,
      max_tokens: 200,
    })
  });

  const data = await response.json();
  res.json({ reply: data.choices[0].text.trim() });
});

app.listen(3000, () => console.log("🚀 Sentient Chat running on http://localhost:3000"));
