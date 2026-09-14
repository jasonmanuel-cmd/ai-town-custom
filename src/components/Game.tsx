import { useRef, useState } from 'react';
import PixiGame from './PixiGame.tsx';

import { useElementSize } from 'usehooks-ts';
import { Stage } from '@pixi/react';
import { ConvexProvider, useConvex, useQuery } from 'convex/react';
import PlayerDetails from './PlayerDetails.tsx';
import { MessageBoard } from './MessageBoard.tsx';
import { ActivityFeed } from './ActivityFeed.tsx';
import { AgentProfile } from './AgentProfile.tsx';
import { DirectMessage } from './DirectMessage.tsx';
import { api } from '../../convex/_generated/api';
import { useWorldHeartbeat } from '../hooks/useWorldHeartbeat.ts';
import { useHistoricalTime } from '../hooks/useHistoricalTime.ts';
import { DebugTimeManager } from './DebugTimeManager.tsx';
import { GameId } from '../../convex/aiTown/ids.ts';
import { useServerGame } from '../hooks/serverGame.ts';

export const SHOW_DEBUG_UI = !!import.meta.env.VITE_SHOW_DEBUG_UI;

type Tab = 'activity' | 'chat' | 'message';

export default function Game() {
  const convex = useConvex();
  const [selectedElement, setSelectedElement] = useState<{
    kind: 'player';
    id: GameId<'players'>;
  }>();
  const [activeTab, setActiveTab] = useState<Tab>('activity');
  const [gameWrapperRef, { width, height }] = useElementSize();

  const worldStatus = useQuery(api.world.defaultWorldStatus);
  const worldId = worldStatus?.worldId;
  const engineId = worldStatus?.engineId;

  const game = useServerGame(worldId);

  // Send a periodic heartbeat to our world to keep it alive.
  useWorldHeartbeat();

  const worldState = useQuery(api.world.worldState, worldId ? { worldId } : 'skip');
  const { historicalTime, timeManager } = useHistoricalTime(worldState?.engine);

  const scrollViewRef = useRef<HTMLDivElement>(null);

  if (!worldId || !engineId || !game) {
    return null;
  }
  return (
    <>
      {SHOW_DEBUG_UI && <DebugTimeManager timeManager={timeManager} width={200} height={100} />}
      <div className="mx-auto w-full max-w grid grid-rows-[240px_1fr] lg:grid-rows-[1fr] lg:grid-cols-[1fr_auto] lg:grow max-w-[1400px] min-h-[480px] game-frame">
        {/* Game area */}
        <div className="relative overflow-hidden bg-brown-900" ref={gameWrapperRef}>
          <div className="absolute inset-0">
            <div className="container">
              <Stage width={width} height={height} options={{ backgroundColor: 0x7ab5ff }}>
                <ConvexProvider client={convex}>
                  <PixiGame
                    game={game}
                    worldId={worldId}
                    engineId={engineId}
                    width={width}
                    height={height}
                    historicalTime={historicalTime}
                    setSelectedElement={setSelectedElement}
                  />
                </ConvexProvider>
              </Stage>
            </div>
          </div>
        </div>
        {/* Right column area */}
        <div
          className="flex flex-col overflow-y-auto shrink-0 px-4 py-6 sm:px-6 lg:w-96 xl:pr-6 border-t-8 sm:border-t-0 sm:border-l-8 border-brown-900  bg-brown-800 text-brown-100"
          ref={scrollViewRef}
        >
          {/* Tabs */}
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg transition-colors ${
                activeTab === 'activity'
                  ? 'bg-amber-600 text-white'
                  : 'bg-brown-700 text-brown-300 hover:bg-brown-600'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg transition-colors ${
                activeTab === 'chat'
                  ? 'bg-amber-600 text-white'
                  : 'bg-brown-700 text-brown-300 hover:bg-brown-600'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('message')}
              className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg transition-colors ${
                activeTab === 'message'
                  ? 'bg-amber-600 text-white'
                  : 'bg-brown-700 text-brown-300 hover:bg-brown-600'
              }`}
            >
              Message
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-amber-400 mb-2">All Conversations</h3>
                <ActivityFeed worldId={worldId} />
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="space-y-3">
              {selectedElement?.id ? (
                <>
                  <AgentProfile worldId={worldId} playerId={selectedElement.id} />
                  <PlayerDetails
                    worldId={worldId}
                    engineId={engineId}
                    game={game}
                    playerId={selectedElement?.id}
                    setSelectedElement={setSelectedElement}
                    scrollViewRef={scrollViewRef}
                  />
                </>
              ) : (
                <div className="text-brown-400 text-xs italic text-center py-8">
                  Click on an agent on the map to see their profile and chat history.
                </div>
              )}
            </div>
          )}

          {activeTab === 'message' && (
            <div className="space-y-3">
              <MessageBoard
                worldId={worldId}
                engineId={engineId}
                playerId={selectedElement?.id}
              />
              <DirectMessage worldId={worldId} engineId={engineId} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
