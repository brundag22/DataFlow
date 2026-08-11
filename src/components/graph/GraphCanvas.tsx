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
  const { nodes, edges, onNodesChange, onEdgesChange, openModal, isInitialized } = useGraphStore();
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
