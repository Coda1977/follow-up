import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  interviews: defineTable({
    uniqueId: v.string(),
    status: v.string(), // "in_progress" | "completed"
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_uniqueId", ["uniqueId"]),

  messages: defineTable({
    interviewId: v.id("interviews"),
    role: v.string(), // "assistant" | "user"
    content: v.string(),
    createdAt: v.number(),
  }).index("by_interview", ["interviewId"]),
});
