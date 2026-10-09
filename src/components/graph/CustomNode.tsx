import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeCategory, NodeDifficulty } from '../../types';

interface CustomNodeData {
  label: string;
  category: NodeCategory;
  difficulty: NodeDifficulty;
  isDue: boolean;
  retention: number | null;
  tags: string[];
  isLocked?: boolean;
  [key: string]: unknown;
}

const categoryConfig: Record<NodeCategory, { icon: string; color: string; bg: string; border: string }> = {
  formula: { icon: '∑', color: '#22d3ee', bg: 'bg-cyan-500/15', border: 'border-l-cyan-500' },
  algorithm: { icon: '◇', color: '#a78bfa', bg: 'bg-violet-500/15', border: 'border-l-violet-500' },
  architecture: { icon: '⬡', color: '#fb7185', bg: 'bg-rose-500/15', border: 'border-l-rose-500' },
  concept: { icon: '◈', color: '#fbbf24', bg: 'bg-amber-500/15', border: 'border-l-amber-500' },
  theorem: { icon: '∿', color: '#34d399', bg: 'bg-emerald-500/15', border: 'border-l-emerald-500' },
};

const difficultyDots: Record<NodeDifficulty, number> = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };

const CustomNodeComponent = ({ data }: NodeProps) => {
  const nodeData = data as unknown as CustomNodeData;
  const config = categoryConfig[nodeData.category];
  const dots = difficultyDots[nodeData.difficulty];
  
  const retentionColor = nodeData.retention !== null
    ? nodeData.retention > 0.8 ? 'text-emerald-400 bg-emerald-500/15'
    : nodeData.retention > 0.5 ? 'text-amber-400 bg-amber-500/15'
    : 'text-rose-400 bg-rose-500/15'
    : '';

  return (
    <div
      className={`
        relative w-[220px] rounded-xl border-l-4 ${config.border}
        bg-white/[0.06] backdrop-blur-xl border border-white/10
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:border-white/20 hover:shadow-lg
        ${nodeData.isDue ? 'animate-glow-pulse ring-1 ring-indigo-500/30' : ''}
      `}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !border-2 !rounded-full" style={{ background: config.color, borderColor: config.color + '40' }} />
      
      <div className="p-3">
        <div className="flex items-start gap-2 mb-2">
          <span className={`flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold ${config.bg}`} style={{ color: config.color }}>
            {config.icon}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white/90 leading-tight line-clamp-2">{nodeData.isLocked ? '🔒 ' : ''}{nodeData.label}</h3>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < dots ? 'bg-white/60' : 'bg-white/15'}`} />
            ))}
          </div>
          
          {nodeData.retention !== null && (
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${retentionColor}`}>
              {Math.round(nodeData.retention * 100)}%
            </span>
          )}
          
          {nodeData.isDue && (
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          )}
          {nodeData.isLocked && <span className="text-[10px] text-amber-300">Prerequisites gated</span>}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !border-2 !rounded-full" style={{ background: config.color, borderColor: config.color + '40' }} />
    </div>
  );
};

export const CustomNode = memo(CustomNodeComponent);
