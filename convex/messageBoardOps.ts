import { internalMutation, internalAction } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { Descriptions } from '../data/characters';
import { chatCompletion } from './util/llm';

export const agentPostToBoard = internalAction({
  args: {
    worldId: v.id('worlds'),
    agentName: v.string(),
    agentIdentity: v.string(),
    recentPosts: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const systemPrompt = `You are ${args.agentName}, ${args.agentIdentity}. 
You live in a small town where residents post messages on a public town square board.
Write one short, in-character message (max 60 words) to post on the town square.
Be natural, specific, and engaging. Reference things happening in town if relevant.
Reply with ONLY the message text, nothing else.`;

    const recentContext = args.recentPosts.length > 0 
      ? `Recent posts on the board:\n${args.recentPosts.map((p: string) => `- ${p}`).join('\n')}`
      : 'The board is quiet right now.';

    const userPrompt = `${recentContext}\n\nWrite your post:`;

    try {
      const { content } = await chatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 120,
        temperature: 0.9,
      });
      
      if (content && content.trim()) {
        await ctx.runMutation(internal.messageBoardOps.agentPost, {
          worldId: args.worldId,
          agentName: args.agentName,
          text: content.trim().slice(0, 400),
        });
      }
    } catch (e) {
      console.warn(`Failed to generate board post for ${args.agentName}:`, e);
    }
  },
});

export const maybeAgentPost = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    // 30% chance per trigger that any agent posts
    if (Math.random() > 0.3) return;

    // Find the default world
    const defaultWorld = await ctx.db
      .query('worldStatus')
      .filter((q: any) => q.eq(q.field('isDefault'), true))
      .first();
    if (!defaultWorld) return;

    // Get recent posts for context
    const posts = await ctx.db
      .query('messageBoard')
      .withIndex('worldId', (q) => q.eq('worldId', defaultWorld.worldId))
      .order('desc')
      .take(10);
    
    const recentPosts = posts.map((p: any) => p.text).reverse();

    // Pick a random character
    const desc = Descriptions[Math.floor(Math.random() * Descriptions.length)];

    await ctx.scheduler.runAfter(0, internal.messageBoardOps.agentPostToBoard, {
      worldId: defaultWorld.worldId,
      agentName: desc.name,
      agentIdentity: desc.identity,
      recentPosts,
    });
  },
});

export const agentPost = internalMutation({
  args: {
    worldId: v.id('worlds'),
    agentName: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('messageBoard', {
      worldId: args.worldId,
      author: args.agentName,
      text: args.text,
    });
  },
});
