import { v } from "convex/values";
import { mutation, query, action, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Create a new interview session
export const create = mutation({
  args: {},
  handler: async (ctx) => {
    // Generate a simple unique ID using timestamp and random number
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const interviewId = await ctx.db.insert("interviews", {
      uniqueId,
      status: "in_progress",
      startedAt: Date.now(),
    });
    return { interviewId, uniqueId };
  },
});

// Get interview by unique ID
export const getByUniqueId = query({
  args: { uniqueId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interviews")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.uniqueId))
      .first();
  },
});

// Get all messages for an interview
export const getMessages = query({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_interview", (q) => q.eq("interviewId", args.interviewId))
      .collect();
  },
});

// Save a message
export const saveMessage = mutation({
  args: {
    interviewId: v.id("interviews"),
    role: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      interviewId: args.interviewId,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

// Mark interview as complete
export const complete = mutation({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.interviewId, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

// Get all completed interviews (for you to review)
export const getAllCompleted = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("interviews")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();
  },
});

// Update detected language for an interview
export const updateLanguage = mutation({
  args: {
    interviewId: v.id("interviews"),
    language: v.string(), // 'en' | 'he'
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) return;

    const isNewLanguage = interview.detectedLanguage !== args.language;
    const currentSwitches = interview.languageSwitches || 0;

    await ctx.db.patch(args.interviewId, {
      detectedLanguage: args.language,
      languageSwitches: isNewLanguage ? currentSwitches + 1 : currentSwitches,
    });
  },
});

// Internal query to get interview by ID
export const getById = internalQuery({
  args: { id: v.id("interviews") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Generate AI summary for an interview using structured outputs (tool use)
export const generateSummary = action({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args): Promise<{
    summary: string;
    keyThemes: string[];
    sentiment: string;
    specificPraise: string[];
    areasForImprovement: string[];
  }> => {
    // Get interview details
    const interview = await ctx.runQuery(internal.interviews.getById, {
      id: args.interviewId,
    });

    if (!interview) {
      throw new Error("Interview not found");
    }

    // Get all messages for this interview
    const messages: Array<{ role: string; content: string; createdAt: number }> =
      await ctx.runQuery(api.interviews.getMessages, {
        interviewId: args.interviewId,
      });

    // Build conversation text
    const conversationText: string = messages
      .map((m: { role: string; content: string }) =>
        `${m.role === 'user' ? 'Client' : 'AI'}: ${m.content}`)
      .join('\n\n');

    // Use tool use for structured outputs
    const response: Response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: `You are analyzing a feedback interview conversation about YP (an organizational psychologist and consultant).

Analyze the conversation and extract key insights. Use the analyze_interview tool to return your analysis.

RULES:
- Use client's actual words for praise and improvement areas (direct quotes)
- Themes should be single words or 2-word phrases
- Sentiment should reflect overall tone
- Be honest - include both positive and negative`,
        messages: [{
          role: 'user',
          content: conversationText,
        }],
        tools: [{
          name: 'analyze_interview',
          description: 'Analyze the interview and return structured insights',
          input_schema: {
            type: 'object',
            properties: {
              summary: {
                type: 'string',
                description: 'A 2-3 sentence overview of the client\'s experience',
              },
              keyThemes: {
                type: 'array',
                items: { type: 'string' },
                description: 'Key themes from the conversation (single words or 2-word phrases)',
              },
              sentiment: {
                type: 'string',
                enum: ['positive', 'mixed', 'negative'],
                description: 'Overall sentiment of the conversation',
              },
              specificPraise: {
                type: 'array',
                items: { type: 'string' },
                description: 'Direct quotes of specific praise from the client',
              },
              areasForImprovement: {
                type: 'array',
                items: { type: 'string' },
                description: 'Direct quotes about areas for improvement',
              },
            },
            required: ['summary', 'keyThemes', 'sentiment', 'specificPraise', 'areasForImprovement'],
          },
        }],
        tool_choice: { type: 'tool', name: 'analyze_interview' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.statusText} - ${errorText}`);
    }

    const data: {
      content: Array<{
        type: string;
        input?: {
          summary: string;
          keyThemes: string[];
          sentiment: string;
          specificPraise: string[];
          areasForImprovement: string[];
        };
      }>;
    } = await response.json();

    // Extract tool use result
    const toolUse = data.content.find((c: { type: string }) => c.type === 'tool_use');
    if (!toolUse || !toolUse.input) {
      throw new Error('No tool use found in response');
    }

    const analysis: {
      summary: string;
      keyThemes: string[];
      sentiment: string;
      specificPraise: string[];
      areasForImprovement: string[];
    } = toolUse.input;

    // Save summary to database
    await ctx.runMutation(api.interviews.saveSummary, {
      interviewId: args.interviewId,
      summary: analysis.summary,
      keyThemes: analysis.keyThemes,
      sentiment: analysis.sentiment,
      specificPraise: analysis.specificPraise,
      areasForImprovement: analysis.areasForImprovement,
    });

    return analysis;
  },
});

// Save AI-generated summary
export const saveSummary = mutation({
  args: {
    interviewId: v.id("interviews"),
    summary: v.string(),
    keyThemes: v.array(v.string()),
    sentiment: v.string(),
    specificPraise: v.array(v.string()),
    areasForImprovement: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.interviewId, {
      summary: args.summary,
      keyThemes: args.keyThemes,
      sentiment: args.sentiment,
      specificPraise: args.specificPraise,
      areasForImprovement: args.areasForImprovement,
      summaryGeneratedAt: Date.now(),
    });
  },
});

// Get cross-interview analysis (aggregated insights)
export const getCrossInterviewAnalysis = query({
  handler: async (ctx) => {
    const completed = await ctx.db
      .query("interviews")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Aggregate themes and sentiment
    const themeCount: Record<string, number> = {};
    const sentimentCount = { positive: 0, mixed: 0, negative: 0 };
    let totalWithSummary = 0;

    completed.forEach(interview => {
      if (interview.keyThemes) {
        totalWithSummary++;
        interview.keyThemes.forEach(theme => {
          themeCount[theme] = (themeCount[theme] || 0) + 1;
        });
      }

      if (interview.sentiment) {
        const sentiment = interview.sentiment as 'positive' | 'mixed' | 'negative';
        sentimentCount[sentiment]++;
      }
    });

    // Get top themes sorted by count
    const topThemes = Object.entries(themeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([theme, count]) => ({ theme, count }));

    return {
      totalInterviews: completed.length,
      totalWithSummary,
      topThemes,
      sentimentDistribution: sentimentCount,
    };
  },
});
