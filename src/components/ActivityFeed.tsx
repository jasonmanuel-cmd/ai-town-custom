import { Id } from '../../convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function ActivityFeed({ worldId }: { worldId: Id<'worlds'> }) {
  const conversations = useQuery(api.world.allConversations, { worldId, limit: 20 } as any);

  if (!conversations || conversations.length === 0) {
    return (
      <div className="text-brown-400 text-xs italic text-center py-4">
        No conversations yet. Agents will start talking soon...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv: any) => (
        <div key={conv._id} className="bg-brown-900/50 rounded-lg p-2 hover:bg-brown-700/50 transition-colors cursor-pointer">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-amber-300">
              {conv.participantNames.join(' & ')}
            </span>
            <span className="text-[10px] text-brown-500">
              {new Date(conv.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {conv.lastMessage && (
            <p className="text-xs text-brown-200 line-clamp-2">
              {conv.lastMessage}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-brown-500">{conv.messageCount} messages</span>
            {conv.ended && <span className="text-[10px] text-green-500">✓ ended</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
