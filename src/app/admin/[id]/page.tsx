"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function TranscriptPage() {
  const params = useParams();
  const uniqueId = params.id as string;

  const interview = useQuery(api.interviews.getByUniqueId, { uniqueId });
  const messages = useQuery(
    api.interviews.getMessages,
    interview?._id ? { interviewId: interview._id } : "skip"
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const generateSummary = useAction(api.interviews.generateSummary);

  const handleGenerateSummary = async () => {
    if (!interview?._id) return;
    setIsGenerating(true);
    try {
      await generateSummary({ interviewId: interview._id });
    } catch (error) {
      console.error('Failed to generate summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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

        {/* AI Summary Section */}
        {interview.summary ? (
          <div className="mb-16 p-8 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-[#1a1a1a]">AI Summary</h2>
              <span className="text-xs text-[#404040] uppercase tracking-wide">
                Generated {new Date(interview.summaryGeneratedAt!).toLocaleDateString()}
              </span>
            </div>

            {/* Overview */}
            <div className="mb-6">
              <p className="text-xl font-light text-[#404040] leading-relaxed">
                {interview.summary}
              </p>
            </div>

            {/* Sentiment Badge */}
            {interview.sentiment && (
              <div className="mb-6">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  interview.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                  interview.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {interview.sentiment.toUpperCase()}
                </span>
              </div>
            )}

            {/* Key Themes */}
            {interview.keyThemes && interview.keyThemes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#404040] uppercase tracking-wide mb-3">
                  Key Themes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {interview.keyThemes.map((theme, i) => (
                    <span key={i} className="px-3 py-1 bg-[#1a1a1a] text-white text-sm rounded-full">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specific Praise */}
            {interview.specificPraise && interview.specificPraise.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3">
                  Specific Praise
                </h3>
                <ul className="space-y-2">
                  {interview.specificPraise.map((praise, i) => (
                    <li key={i} className="text-base text-[#404040] pl-4 border-l-2 border-green-500">
                      "{praise}"
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Improvement */}
            {interview.areasForImprovement && interview.areasForImprovement.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-orange-700 uppercase tracking-wide mb-3">
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {interview.areasForImprovement.map((area, i) => (
                    <li key={i} className="text-base text-[#404040] pl-4 border-l-2 border-orange-500">
                      "{area}"
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleGenerateSummary}
              disabled={isGenerating}
              className="mt-6 text-sm text-[#404040] hover:text-[#e07a5f] transition-colors underline disabled:opacity-50"
            >
              {isGenerating ? 'Regenerating...' : 'Regenerate Summary'}
            </button>
          </div>
        ) : (
          <div className="mb-16 p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-lg text-[#404040] mb-4">No summary generated yet</p>
            <button
              onClick={handleGenerateSummary}
              disabled={isGenerating}
              className="bg-[#1a1a1a] text-white px-6 py-3 text-sm font-semibold hover:bg-[#e07a5f] transition-colors disabled:opacity-50"
            >
              {isGenerating ? 'Generating Summary...' : 'Generate AI Summary'}
            </button>
          </div>
        )}

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
