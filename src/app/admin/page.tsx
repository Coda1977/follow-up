"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AdminPage() {
  const interviews = useQuery(api.interviews.getAllCompleted);

  return (
    <div className="min-h-screen bg-white px-8 md:px-16 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-black text-[#1a1a1a] mb-16">Interviews</h1>

        {!interviews?.length ? (
          <p className="text-2xl font-light text-[#404040]">Nothing here yet.</p>
        ) : (
          <div className="space-y-8">
            {interviews.map((interview) => (
              <a
                key={interview._id}
                href={`/admin/${interview.uniqueId}`}
                className="block py-6 border-b border-gray-200 hover:border-[#e07a5f] transition-colors group"
              >
                <p className="text-3xl font-bold text-[#1a1a1a] mb-2 group-hover:text-[#e07a5f] transition-colors">
                  #{interview.uniqueId}
                </p>
                <p className="text-sm font-light text-[#404040] tracking-wide uppercase">
                  {new Date(interview.completedAt!).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
