import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  interviews: defineTable({
    uniqueId: v.string(),
    status: v.string(), // "in_progress" | "completed"
    startedAt: v.number(),
    completedAt: v.optional(v.number()),

    // Language tracking
    detectedLanguage: v.optional(v.string()), // 'en' | 'he'
    languageSwitches: v.optional(v.number()),

    // AI-generated summary fields
    summary: v.optional(v.string()),
    keyThemes: v.optional(v.array(v.string())),
    sentiment: v.optional(v.string()), // "positive" | "mixed" | "negative"
    specificPraise: v.optional(v.array(v.string())),
    areasForImprovement: v.optional(v.array(v.string())),
    summaryGeneratedAt: v.optional(v.number()),
  }).index("by_uniqueId", ["uniqueId"]),

  messages: defineTable({
    interviewId: v.id("interviews"),
    role: v.string(), // "assistant" | "user"
    content: v.string(),
    createdAt: v.number(),
  }).index("by_interview", ["interviewId"]),
});
