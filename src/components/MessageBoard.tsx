import { useState } from 'react';
import { Doc, Id } from '../../convex/_generated/dataModel';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface BoardPost {
  _id: Id<'messageBoard'>;
  _creationTime: number;
  worldId: Id<'worlds'>;
  author: any;
  text: string;
  authorName?: string;
}

export function MessageBoard({
  worldId,
  engineId,
  playerId,
}: {
  worldId: Id<'worlds'>;
  engineId: Id<'engines'>;
  playerId?: any;
}) {
  const [newMessage, setNewMessage] = useState('');
  const [showBoard, setShowBoard] = useState(true);

  const posts = useQuery(api.messageBoard.listBoardPosts, { worldId });
  const postToBoard = useMutation(api.messageBoard.postToBoard);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !playerId) return;
    await postToBoard({
      worldId,
      playerId,
      text: newMessage.trim().slice(0, 280),
    });
    setNewMessage('');
  };

  return (
    <div className="bg-brown-800 rounded-lg p-3 border border-brown-700">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
          📋 Town Square
          <span className="text-xs font-normal text-brown-400">
            ({posts?.length || 0} posts)
          </span>
        </h3>
        <button
          onClick={() => setShowBoard(!showBoard)}
          className="text-xs text-brown-400 hover:text-brown-200"
        >
          {showBoard ? '▼' : '▶'}
        </button>
      </div>

      {showBoard && (
        <>
          <div className="max-h-48 overflow-y-auto space-y-2 mb-3 scrollbar-thin">
            {posts === undefined ? (
              <p className="text-brown-500 text-xs italic">Loading...</p>
            ) : posts.length === 0 ? (
              <p className="text-brown-500 text-xs italic">
                No messages yet. Be the first!
              </p>
            ) : (
              posts.map((post: BoardPost) => (
                <div key={post._id} className="bg-brown-900/70 rounded px-2 py-1.5 text-xs">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-semibold text-amber-300/80">
                      {post.authorName || 'Resident'}
                    </span>
                    <span className="text-brown-500 text-[10px]">
                      {new Date(post._creationTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-brown-200 leading-tight">{post.text}</p>
                </div>
              ))
            )}
          </div>

          {playerId && (
            <form onSubmit={handleSubmit} className="flex gap-1.5">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Post to the town square..."
                maxLength={280}
                className="flex-1 bg-brown-900 border border-brown-700 rounded px-2 py-1.5 text-xs text-brown-100 placeholder-brown-500 focus:outline-none focus:border-amber-600"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-amber-700 hover:bg-amber-600 disabled:bg-brown-700 disabled:text-brown-500 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
              >
                Post
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
