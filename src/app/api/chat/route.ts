import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { SYSTEM_PROMPT_EN, SYSTEM_PROMPT_HE } from "@/lib/prompt";
import type { UIMessage, StandardMessage, Language } from "@/types";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Get language from custom header
  const language = (req.headers.get('X-Language') || 'en') as Language;

  // Select appropriate system prompt
  const systemPrompt = language === 'he' ? SYSTEM_PROMPT_HE : SYSTEM_PROMPT_EN;

  // Convert UI messages (with parts) to standard format (with content)
  const convertedMessages: StandardMessage[] = messages.map((msg) => {
    if (msg.parts) {
      // New format with parts - extract text content
      const textContent = msg.parts
        .filter((p) => p.type === 'text')
        .map((p) => p.text)
        .join('');
      return {
        role: msg.role,
        content: textContent,
      };
    }
    // Already in correct format (shouldn't happen with new AI SDK)
    return msg as unknown as StandardMessage;
  });

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt,
    messages: convertedMessages,
  });

  return result.toTextStreamResponse();
}
