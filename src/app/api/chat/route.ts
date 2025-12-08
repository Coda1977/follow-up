import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { SYSTEM_PROMPT } from "@/lib/prompt";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Convert UI messages (with parts) to standard format (with content)
  const convertedMessages = messages.map((msg: any) => {
    if (msg.parts) {
      // New format with parts - extract text content
      const textContent = msg.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join('');
      return {
        role: msg.role,
        content: textContent,
      };
    }
    // Already in correct format
    return msg;
  });

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: SYSTEM_PROMPT,
    messages: convertedMessages,
  });

  return result.toTextStreamResponse();
}
