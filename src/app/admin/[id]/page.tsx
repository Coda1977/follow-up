"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";

export default function TranscriptPage() {
  const params = useParams();
  const uniqueId = params.id as string;

  const interview = useQuery(api.interviews.getByUniqueId, { uniqueId });
  const messages = useQuery(
    api.interviews.getMessages,
    interview?._id ? { interviewId: interview._id } : "skip"
  );

  if (!interview || !messages) {
    return <p className="p-8">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-white px-8 md:px-16 py-16">
      <div className="max-w-4xl mx-auto">
        <a
          href="/admin"
          className="inline-block mb-12 text-sm font-semibold text-[#1a1a1a] hover:text-[#e07a5f] transition-colors"
        >
          ← All Interviews
        </a>

        <h1 className="text-5xl font-black text-[#1a1a1a] mb-4">
          #{interview.uniqueId}
        </h1>
        <p className="text-sm font-light text-[#404040] tracking-wide uppercase mb-16">
          Completed: {new Date(interview.completedAt!).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>

        <div className="space-y-12">
          {messages.map((message, i) => (
            <div key={i} className={message.role === "user" ? "text-right" : "text-left"}>
              <p className="text-xs font-semibold text-[#404040] tracking-wide uppercase mb-2">
                {message.role === "user" ? "Client" : "AI"}
              </p>
              {message.role === "assistant" ? (
                <p className="text-2xl font-light text-[#404040] leading-relaxed">
                  {message.content}
                </p>
              ) : (
                <p className="text-xl font-semibold text-[#1a1a1a] leading-relaxed">
                  {message.content}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
