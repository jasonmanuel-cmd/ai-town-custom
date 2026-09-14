import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { insertInput } from './aiTown/insertInput';
import { playerId } from './aiTown/ids';

export const listBoardPosts = query({
  args: {
    worldId: v.id('worlds'),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query('messageBoard')
      .withIndex('worldId', (q) => q.eq('worldId', args.worldId))
      .order('desc')
      .take(50);

    // Join with player descriptions to get author names
    const out = [];
    for (const post of posts) {
      let authorName = 'Resident';
      try {
        // author can be either a playerId or a string name (for agent posts)
        if (typeof post.author === 'string') {
          authorName = post.author;
        } else {
          const playerDesc = await ctx.db
            .query('playerDescriptions')
            .withIndex('worldId', (q) => q.eq('worldId', args.worldId).eq('playerId', post.author))
            .first();
          if (playerDesc) authorName = playerDesc.name;
        }
      } catch {}
      out.push({ ...post, authorName });
    }
    return out;
  },
});

export const postToBoard = mutation({
  args: {
    worldId: v.id('worlds'),
    playerId,
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('messageBoard', {
      worldId: args.worldId,
      author: args.playerId,
      text: args.text,
    });
    await insertInput(ctx, args.worldId, 'finishBoardPost', {
      playerId: args.playerId,
      timestamp: Date.now(),
    });
  },
});
