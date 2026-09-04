import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { description, excludeNames } = await req.json();

  if (!description?.trim()) {
    return NextResponse.json(
      { error: "Please provide a business description." },
      { status: 400 }
    );
  }

  const exclusionClause =
    excludeNames?.length > 0
      ? `\n\nDo NOT use any of these previously generated names — every name must be completely new and different:\n${excludeNames.map((n: string) => `- ${n}`).join("\n")}`
      : "";

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    temperature: 1,
    messages: [
      {
        role: "user",
        content: `You are a creative branding expert. Generate 8 unique, catchy business name ideas based on the following description or ideas:

"${description}"${exclusionClause}

Return ONLY a JSON array of objects with this exact structure (no markdown, no extra text):
[
  { "name": "BusinessName", "tagline": "A short punchy tagline", "why": "One sentence on why this name works" },
  ...
]

Make the names creative, memorable, and varied — mix wordplay, metaphors, compound words, and invented words. Keep taglines under 8 words.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const names = JSON.parse(text);
    return NextResponse.json({ names });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse generated names." },
      { status: 500 }
    );
  }
}
