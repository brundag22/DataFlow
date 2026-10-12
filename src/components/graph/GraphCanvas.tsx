import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomNode } from './CustomNode';
import { useGraphStore } from '../../stores/graphStore';

const nodeTypes: NodeTypes = { knowledge: CustomNode };

function GraphCanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onNodeDragStop, autoLayout, openModal, openEditor, isInitialized } = useGraphStore();
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (isInitialized) {
      setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
    }
  }, [isInitialized, fitView]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    openModal(node.id);
  }, [openModal]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodeDragStop={(_, node) => { void onNodeDragStop(node); }}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2, opacity: 0.5 },
        }}
        proOptions={{ hideAttribution: true }}
        fitView
        minZoom={0.2}
        maxZoom={2}
        className="bg-surface-950"
      >
        <Background variant={BackgroundVariant.Dots} color="#1e1b4b" gap={20} size={1} />
        <Controls
          className="!bg-white/[0.06] !border-white/10 !rounded-xl !shadow-2xl [&>button]:!bg-white/[0.06] [&>button]:!border-white/10 [&>button]:!text-white/60 [&>button:hover]:!bg-white/10"
          position="bottom-right"
        />
        <MiniMap
          className="!bg-surface-950/90 !border-white/10 !rounded-xl"
          maskColor="rgba(8,6,32,0.85)"
          nodeColor={(n) => {
            const colors: Record<string, string> = { formula:'#22d3ee', algorithm:'#a78bfa', architecture:'#fb7185', concept:'#fbbf24', theorem:'#34d399' };
            return colors[(n.data as any)?.category] || '#6366f1';
          }}
          position="bottom-left"
        />
        <Panel position="top-left">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              D
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                DataFlow
              </h1>
              <p className="text-[10px] text-white/40 font-medium tracking-wider uppercase">Knowledge Graph Engine</p>
            </div>
          </div>
        </Panel>
        <Panel position="top-right">
          <button aria-label="Auto layout graph" onClick={() => void autoLayout()} disabled={nodes.length < 2} className="rounded-lg border border-white/10 bg-surface-950/80 px-3 py-2 text-xs text-white/70 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">Auto-layout</button>
        </Panel>
        {nodes.length === 0 && (
          <Panel position="top-center">
            <div className="mt-20 w-[min(92vw,30rem)] max-w-xl rounded-2xl border border-indigo-400/20 bg-[#0f0d2e]/95 p-8 text-center shadow-2xl backdrop-blur-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-2xl font-bold text-white shadow-lg shadow-indigo-500/20">+</div>
              <h2 className="mt-5 text-2xl font-bold text-white">Start your knowledge graph</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/55">Create your first concept, then connect it to prerequisites as your map grows. Your graph stays in this browser and is ready whenever you are.</p>
              <button onClick={() => openEditor()} className="mt-6 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110">Create your first node</button>
              <p className="mt-4 text-xs text-white/30">You can also import a saved JSON backup from Settings.</p>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

export function GraphCanvas() {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner />
    </ReactFlowProvider>
  );
}
