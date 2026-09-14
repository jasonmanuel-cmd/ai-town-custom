import { Id } from '../../convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface AgentProfileProps {
  worldId: Id<'worlds'>;
  playerId: string;
  onClose?: () => void;
}

export function AgentProfile({ worldId, playerId, onClose }: AgentProfileProps) {
  const descriptions = useQuery(api.world.gameDescriptions, { worldId });
  const memories = useQuery(api.world.agentMemory, { worldId, playerId } as any);
  
  const playerDesc = descriptions?.playerDescriptions.find((p: any) => p.playerId === playerId);
  const agentDesc = descriptions?.agentDescriptions.find((a: any) => a.playerId === playerId);

  if (!playerDesc) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-lg">
            {playerDesc.name[0]}
          </div>
          <div>
            <h3 className="font-bold text-brown-100">{playerDesc.name}</h3>
            <p className="text-xs text-brown-400">{agentDesc?.identity?.slice(0, 60) || playerDesc.description}...</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-brown-400 hover:text-brown-200">✕</button>
        )}
      </div>

      {agentDesc?.plan && (
        <div>
          <h4 className="text-xs font-bold text-amber-400 mb-1">Current Goal</h4>
          <p className="text-xs text-brown-200 bg-brown-900/50 rounded p-2 italic">"{agentDesc.plan}"</p>
        </div>
      )}

      {memories && memories.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-amber-400 mb-1">Recent Memories</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
            {memories.slice(0, 8).map((mem: any) => (
              <div key={mem._id} className="text-xs bg-brown-900/50 rounded p-2">
                <p className="text-brown-200">
                  {mem.data?.text || mem.data?.content || typeof mem.data === 'string' ? mem.data : JSON.stringify(mem.data)}
                </p>
                <span className="text-brown-500 text-[10px]">{new Date(mem._creationTime).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-brown-900/50 rounded p-2 text-center">
          <span className="text-brown-400">Character</span>
          <p className="text-brown-100 font-bold">{playerDesc.character || 'Agent'}</p>
        </div>
        <div className="bg-brown-900/50 rounded p-2 text-center">
          <span className="text-brown-400">Status</span>
          <p className="text-brown-100 font-bold">Active</p>
        </div>
      </div>
    </div>
  );
}
