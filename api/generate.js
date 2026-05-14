export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt } = req.body;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a world-class LinkedIn ghostwriter who has helped founders go viral. You write posts that feel deeply human, specific, and emotionally resonant.

Your writing style:
- Opens with ONE line that is so specific or surprising that people stop scrolling
- Uses short paragraphs — 1 to 2 sentences max per paragraph
- Builds tension before revealing the insight
- Includes real numbers, real emotions, real moments — never vague
- Ends with a line that makes people think or feel something
- Sounds like a real person talking to a friend, not a marketer

Posts you write are 400 to 600 words long — substantial enough to create real impact, not just a quick thought. Each paragraph is separated by a blank line for readability.

You always respond with valid JSON only. No markdown, no backticks, no extra text.`
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.85,
        max_tokens: 2500,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Groq API error");

    const text = data.choices?.[0]?.message?.content || "";
    res.status(200).json({ text });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
