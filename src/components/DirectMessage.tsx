import { useState } from 'react';
import { Id } from '../../convex/_generated/dataModel';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function DirectMessage({ worldId, engineId }: { worldId: Id<'worlds'>; engineId: Id<'engines'> }) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const descriptions = useQuery(api.world.gameDescriptions, { worldId });
  const agents = descriptions?.agentDescriptions || [];

  const handleSend = async () => {
    if (!selectedAgent || !message.trim() || sending) return;
    setSending(true);
    try {
      setSent(true);
      setMessage('');
      setTimeout(() => setSent(false), 2000);
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-brown-800 rounded-lg p-3 border border-brown-700">
      <h3 className="text-sm font-bold text-amber-400 mb-2">Direct Message</h3>
      
      <select
        value={selectedAgent || ''}
        onChange={(e) => setSelectedAgent(e.target.value)}
        className="w-full bg-brown-900 border border-brown-700 rounded px-2 py-1.5 text-xs text-brown-100 mb-2"
      >
        <option value="">Select an agent...</option>
        {agents.map((agent: any) => (
          <option key={agent.agentId} value={agent.agentId}>
            {agent.identity?.split('.')[0] || agent.agentId}
          </option>
        ))}
      </select>

      <div className="flex gap-1.5">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-brown-900 border border-brown-700 rounded px-2 py-1.5 text-xs text-brown-100 placeholder-brown-500"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!selectedAgent || !message.trim() || sending}
          className="bg-amber-700 hover:bg-amber-600 disabled:bg-brown-700 text-white text-xs font-bold px-3 py-1.5 rounded"
        >
          {sending ? '...' : sent ? '✓' : 'Send'}
        </button>
      </div>
      {sent && (
        <p className="text-green-400 text-xs mt-2">Message sent! (DM feature coming soon)</p>
      )}
    </div>
  );
}
