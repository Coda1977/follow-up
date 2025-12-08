"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { OPENING_MESSAGE } from "@/lib/prompt";
import { Id } from "../../../../convex/_generated/dataModel";

export default function InterviewPage() {
  const params = useParams();
  const uniqueId = params.id as string;

  const interview = useQuery(api.interviews.getByUniqueId, { uniqueId });
  const saveMessage = useMutation(api.interviews.saveMessage);
  const completeInterview = useMutation(api.interviews.complete);

  const [isComplete, setIsComplete] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    setInput(""); // Clear input immediately

    await saveMessage({
      interviewId: interview._id as Id<"interviews">,
      role: "user",
      content: messageContent,
    });

    sendMessage({ text: messageContent });
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-8 space-y-6">
          <h1 className="text-6xl font-black text-[#1a1a1a]">Thank you.</h1>
          <p className="text-2xl font-light text-[#404040]">Your words matter.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 px-8 py-6 flex items-center justify-between">
        <h1 className="text-sm font-light text-[#404040] tracking-wide uppercase">Conversation</h1>
        {messages.length > 0 && (
          <button
            onClick={handleEndInterview}
            className="bg-[#1a1a1a] text-white px-6 py-2 text-sm font-semibold hover:bg-[#e07a5f] transition-colors duration-300"
          >
            End
          </button>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 md:px-16 py-12 max-w-4xl mx-auto w-full space-y-12">
        {/* Show opening message only if no messages yet */}
        {messages.length === 0 && (
          <div className="text-left">
            <p className="text-2xl font-light text-[#404040] leading-relaxed">
              {OPENING_MESSAGE}
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
              className={message.role === "user" ? "text-right" : "text-left"}
            >
              {message.role === "assistant" ? (
                <p className="text-2xl font-light text-[#404040] leading-relaxed">
                  {textContent}
                </p>
              ) : (
                <p className="text-xl font-semibold text-[#1a1a1a] leading-relaxed">
                  {textContent}
                </p>
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
            placeholder="Type here..."
            className="flex-1 text-xl font-semibold text-[#1a1a1a] border-b-2 border-gray-200 pb-2 focus:outline-none focus:border-[#1a1a1a] transition-colors bg-transparent placeholder:text-gray-300"
            disabled={status === "streaming"}
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
