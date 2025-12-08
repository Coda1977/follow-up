import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new interview session
export const create = mutation({
  args: {},
  handler: async (ctx) => {
    const uniqueId = crypto.randomUUID().slice(0, 8);
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
