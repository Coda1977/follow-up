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
    <div className="min-h-screen bg-gray-50 p-8">
      <a href="/admin" className="text-blue-500 hover:underline mb-4 block">
        ← Back to all interviews
      </a>

      <h1 className="text-2xl font-semibold mb-6">
        Transcript: #{interview.uniqueId}
      </h1>

      <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
        {messages.map((message, i) => (
          <div key={i} className={message.role === "user" ? "pl-8" : ""}>
            <p className="text-xs text-gray-400 mb-1">
              {message.role === "user" ? "Client" : "AI"}
            </p>
            <p className={message.role === "user" ? "text-blue-600 font-medium" : "text-gray-900"}>
              {message.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
