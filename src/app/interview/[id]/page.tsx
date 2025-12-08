"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { getPrompts } from "@/lib/prompt";
import { Id } from "../../../../convex/_generated/dataModel";
import { franc } from "franc-min";

export default function InterviewPage() {
  const params = useParams();
  const uniqueId = params.id as string;

  const interview = useQuery(api.interviews.getByUniqueId, { uniqueId });
  const saveMessage = useMutation(api.interviews.saveMessage);
  const completeInterview = useMutation(api.interviews.complete);
  const updateLanguage = useMutation(api.interviews.updateLanguage);

  const [isComplete, setIsComplete] = useState(false);
  const [input, setInput] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState<'en' | 'he'>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get language-specific prompts
  const prompts = getPrompts(detectedLanguage);

  // Language detection helper
  const detectLanguage = (text: string): 'en' | 'he' => {
    const langCode = franc(text, { minLength: 3 });
    // franc returns 'heb' for Hebrew, 'eng' for English
    if (langCode === 'heb') return 'he';
    return 'en';
  };

  const { messages, sendMessage, status } = useChat({
    transport: new TextStreamChatTransport({ api: "/api/chat" }),
    onFinish: async ({ message }) => {
      if (interview?._id) {
        // Get the text content from the message and save it
        const textPart = message.parts.find(p => p.type === 'text');
        if (textPart && 'text' in textPart) {
          await saveMessage({
            interviewId: interview._id as Id<"interviews">,
            role: "assistant",
            content: textPart.text,
          });
        }
      }
    },
  });

  // Save user messages and send
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !interview?._id) return;

    const messageContent = input;

    // Detect language and update if changed
    const detected = detectLanguage(messageContent);
    if (detected !== detectedLanguage) {
      setDetectedLanguage(detected);
      await updateLanguage({
        interviewId: interview._id as Id<"interviews">,
        language: detected,
      });
    }

    setInput(""); // Clear input immediately

    await saveMessage({
      interviewId: interview._id as Id<"interviews">,
      role: "user",
      content: messageContent,
    });

    sendMessage({
      text: messageContent,
      experimental_data: { language: detected }
    });
  };

  // End interview manually
  const handleEndInterview = async () => {
    if (interview?._id) {
      await completeInterview({ interviewId: interview._id as Id<"interviews"> });
      setIsComplete(true);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" dir={detectedLanguage === 'he' ? 'rtl' : 'ltr'}>
        <div className="text-center p-8 space-y-6">
          <h1 className="text-6xl font-black text-[#1a1a1a]">{prompts.thankYou.title}</h1>
          <p className="text-2xl font-light text-[#404040]">{prompts.thankYou.subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" dir={detectedLanguage === 'he' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b border-gray-200 px-8 py-6 flex items-center justify-between">
        <h1 className="text-sm font-light text-[#404040] tracking-wide uppercase">Conversation</h1>
        {messages.length > 0 && (
          <button
            onClick={handleEndInterview}
            className="bg-[#1a1a1a] text-white px-6 py-2 text-sm font-semibold hover:bg-[#e07a5f] transition-colors duration-300"
          >
            {prompts.endButton}
          </button>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 md:px-16 py-12 max-w-4xl mx-auto w-full space-y-12">
        {/* Show opening message only if no messages yet */}
        {messages.length === 0 && (
          <div className="text-left">
            <p className="text-2xl font-light text-[#404040] leading-relaxed">
              {prompts.openingMessage}
            </p>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((message) => {
          // Extract text content from message parts
          const textContent = message.parts
            .filter(p => p.type === 'text')
            .map(p => 'text' in p ? p.text : '')
            .join('');

          return (
            <div
              key={message.id}
              className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              {message.role === "assistant" ? (
                <div className="max-w-3xl px-6 py-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                  <p className="text-2xl font-light text-[#404040] leading-relaxed">
                    {textContent}
                  </p>
                </div>
              ) : (
                <div className="max-w-2xl px-6 py-4 rounded-2xl bg-[#1a1a1a] border border-[#1a1a1a]">
                  <p className="text-xl font-semibold text-white leading-relaxed">
                    {textContent}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {status === "streaming" && (
          <div className="text-left">
            <span className="text-2xl font-light text-[#404040] animate-pulse">...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleFormSubmit} className="border-t border-gray-200 px-8 md:px-16 py-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={detectedLanguage === 'he' ? 'הקלד כאן...' : 'Type here...'}
            className={`flex-1 text-xl font-semibold text-[#1a1a1a] border-b-2 border-gray-200 pb-2 focus:outline-none focus:border-[#1a1a1a] transition-colors bg-transparent placeholder:text-gray-300 ${detectedLanguage === 'he' ? 'text-right' : 'text-left'}`}
            disabled={status === "streaming"}
            dir={detectedLanguage === 'he' ? 'rtl' : 'ltr'}
          />
          <button
            type="submit"
            disabled={status === "streaming" || !input.trim()}
            className="bg-[#1a1a1a] text-white px-8 py-3 text-lg font-bold hover:bg-[#e07a5f] disabled:opacity-30 disabled:hover:bg-[#1a1a1a] transition-colors duration-300"
          >
            →
          </button>
        </div>
      </form>
    </div>
  );
}
