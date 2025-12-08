"use client";

import { useChat } from "ai/react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: [
      { id: "opening", role: "assistant", content: OPENING_MESSAGE }
    ],
    onFinish: async (message) => {
      if (interview?._id) {
        await saveMessage({
          interviewId: interview._id as Id<"interviews">,
          role: "assistant",
          content: message.content,
        });

        // Check if we should end the interview (after ~8 exchanges)
        const userMessages = messages.filter(m => m.role === "user").length;
        if (userMessages >= 6 && message.content.toLowerCase().includes("thank")) {
          setIsComplete(true);
          await completeInterview({ interviewId: interview._id as Id<"interviews"> });
        }
      }
    },
  });

  // Save user messages
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !interview?._id) return;

    await saveMessage({
      interviewId: interview._id as Id<"interviews">,
      role: "user",
      content: input,
    });

    handleSubmit(e);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-semibold mb-2">Thank you!</h1>
          <p className="text-gray-600">Your feedback has been recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <h1 className="text-lg font-semibold text-center">Feedback Interview</h1>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-gray-200"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleFormSubmit} className="bg-white border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your response..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 text-white rounded-full px-6 py-2 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
