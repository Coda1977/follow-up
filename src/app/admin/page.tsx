"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export default function AdminPage() {
  const interviews = useQuery(api.interviews.getAllCompleted);
  const analysis = useQuery(api.interviews.getCrossInterviewAnalysis);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [isGeneratingOverall, setIsGeneratingOverall] = useState(false);
  const [overallSummary, setOverallSummary] = useState<{
    overallSummary: string;
    keyStrengths: string[];
    keyWeaknesses: string[];
    commonPatterns: string[];
    actionableInsights: string[];
  } | null>(null);

  const generateOverallSummary = useAction(api.interviews.generateOverallSummary);

  const handleGenerateOverallSummary = async () => {
    setIsGeneratingOverall(true);
    try {
      const result = await generateOverallSummary({});
      setOverallSummary(result);
    } catch (error) {
      console.error('Failed to generate overall summary:', error);
      alert('Failed to generate overall summary. Please try again.');
    } finally {
      setIsGeneratingOverall(false);
    }
  };

  // Filter interviews by selected theme
  const filteredInterviews = selectedTheme
    ? interviews?.filter(i => i.keyThemes?.includes(selectedTheme))
    : interviews;

  return (
    <div className="min-h-screen bg-white px-8 md:px-16 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-black text-[#1a1a1a] mb-16">Interviews</h1>

        {/* Overall Summary Section */}
        {interviews && interviews.length > 0 && (
          <div className="mb-16 p-8 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-lg border border-gray-800 text-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Overall Insights</h2>
              <button
                onClick={handleGenerateOverallSummary}
                disabled={isGeneratingOverall}
                className="bg-[#e07a5f] text-white px-6 py-3 text-sm font-semibold hover:bg-[#d06a4f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                {isGeneratingOverall ? 'Generating...' : overallSummary ? 'Regenerate' : 'Generate Overall Summary'}
              </button>
            </div>

            {overallSummary ? (
              <div className="space-y-8">
                {/* Overall Summary */}
                <div>
                  <p className="text-xl font-light leading-relaxed opacity-90">
                    {overallSummary.overallSummary}
                  </p>
                </div>

                {/* Key Strengths */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 text-green-400">
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {overallSummary.keyStrengths.map((strength, i) => (
                      <li key={i} className="text-base opacity-90 pl-4 border-l-2 border-green-400">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Weaknesses */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 text-orange-400">
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {overallSummary.keyWeaknesses.map((weakness, i) => (
                      <li key={i} className="text-base opacity-90 pl-4 border-l-2 border-orange-400">
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Common Patterns */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 text-blue-400">
                    Common Patterns
                  </h3>
                  <ul className="space-y-2">
                    {overallSummary.commonPatterns.map((pattern, i) => (
                      <li key={i} className="text-base opacity-90 pl-4 border-l-2 border-blue-400">
                        {pattern}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actionable Insights */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 text-purple-400">
                    Actionable Insights
                  </h3>
                  <ul className="space-y-2">
                    {overallSummary.actionableInsights.map((insight, i) => (
                      <li key={i} className="text-base opacity-90 pl-4 border-l-2 border-purple-400">
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-base opacity-70">
                Generate an AI-powered summary analyzing all {interviews.length} interviews together to identify patterns, strengths, and actionable insights.
              </p>
            )}
          </div>
        )}

        {/* Analytics Overview */}
        {analysis && analysis.totalWithSummary > 0 && (
          <div className="mb-16 p-8 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-8">Overview</h2>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-5xl font-black text-[#1a1a1a] mb-2">
                  {analysis.totalInterviews}
                </div>
                <div className="text-sm font-light text-[#404040] uppercase tracking-wide">
                  Total Interviews
                </div>
              </div>

              <div className="text-center">
                <div className="text-5xl font-black text-green-600 mb-2">
                  {analysis.sentimentDistribution.positive}
                </div>
                <div className="text-sm font-light text-[#404040] uppercase tracking-wide">
                  Positive
                </div>
              </div>

              <div className="text-center">
                <div className="text-5xl font-black text-orange-600 mb-2">
                  {analysis.sentimentDistribution.mixed + analysis.sentimentDistribution.negative}
                </div>
                <div className="text-sm font-light text-[#404040] uppercase tracking-wide">
                  Mixed/Negative
                </div>
              </div>
            </div>

            {/* Top Themes */}
            {analysis.topThemes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#404040] uppercase tracking-wide mb-4">
                  Most Common Themes
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedTheme(null)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                      selectedTheme === null
                        ? 'bg-[#1a1a1a] text-white'
                        : 'bg-white border border-gray-300 text-[#404040] hover:border-[#1a1a1a]'
                    }`}
                  >
                    All ({analysis.totalInterviews})
                  </button>
                  {analysis.topThemes.map(({ theme, count }) => (
                    <button
                      key={theme}
                      onClick={() => setSelectedTheme(theme)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                        selectedTheme === theme
                          ? 'bg-[#e07a5f] text-white'
                          : 'bg-white border border-gray-300 text-[#404040] hover:border-[#e07a5f]'
                      }`}
                    >
                      {theme} ({count})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interview List Header */}
        <h2 className="text-4xl font-bold text-[#1a1a1a] mb-8">
          {selectedTheme ? `Interviews about "${selectedTheme}"` : 'All Interviews'}
        </h2>

        {!filteredInterviews?.length ? (
          <p className="text-2xl font-light text-[#404040]">
            {selectedTheme ? `No interviews found for "${selectedTheme}".` : 'Nothing here yet.'}
          </p>
        ) : (
          <div className="space-y-8">
            {filteredInterviews.map((interview) => (
              <a
                key={interview._id}
                href={`/admin/${interview.uniqueId}`}
                className="block py-6 border-b border-gray-200 hover:border-[#e07a5f] transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-3xl font-bold text-[#1a1a1a] group-hover:text-[#e07a5f] transition-colors">
                    #{interview.uniqueId}
                  </p>

                  {/* Sentiment Badge */}
                  {interview.sentiment && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      interview.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                      interview.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {interview.sentiment}
                    </span>
                  )}
                </div>

                {/* Theme Tags */}
                {interview.keyThemes && interview.keyThemes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {interview.keyThemes.map((theme, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-[#404040] text-xs rounded">
                        {theme}
                      </span>
                    ))}
                  </div>
                )}

                {/* Summary Preview */}
                {interview.summary && (
                  <p className="text-base font-light text-[#404040] mb-3 line-clamp-2">
                    {interview.summary}
                  </p>
                )}

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
