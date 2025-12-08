import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { SYSTEM_PROMPT_EN, SYSTEM_PROMPT_HE } from "@/lib/prompt";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, experimental_data } = await req.json();

  // Get language from experimental_data
  const language = experimental_data?.language || 'en';

  // Select appropriate system prompt
  const systemPrompt = language === 'he' ? SYSTEM_PROMPT_HE : SYSTEM_PROMPT_EN;

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
    system: systemPrompt,
    messages: convertedMessages,
  });

  return result.toTextStreamResponse();
}
