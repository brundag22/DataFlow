import { create } from 'zustand';
import { type Node, type Edge, applyNodeChanges, applyEdgeChanges, type NodeChange, type EdgeChange } from '@xyflow/react';
import type { KnowledgeNode, ViewMode, SidebarTab } from '../types';
import { db } from '../db/database';
import { seedNodes, seedEdges, seedPositions } from '../data/seedData';
import { initializeCards, getDueNodeIds, getAllRetentions } from '../engine/scheduler';

function knowledgeNodeToFlowNode(node: KnowledgeNode, position: { x: number; y: number }, isDue: boolean, retention: number | null): Node {
  return {
    id: node.id,
    type: 'knowledge',
    position,
    data: {
      label: node.title,
      category: node.category,
      difficulty: node.difficulty,
      isDue,
      retention,
      tags: node.tags,
    },
  };
}

function createFlowEdge(source: string, target: string): Edge {
  return {
    id: `${source}->${target}`,
    source,
    target,
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2, opacity: 0.6 },
  };
}

interface GraphState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  isModalOpen: boolean;
  viewMode: ViewMode;
  sidebarTab: SidebarTab;
  sidebarCollapsed: boolean;
  searchQuery: string;
  filterCategory: string | null;
  isInitialized: boolean;
  dueNodeIds: Set<string>;
  nodeRetentions: Map<string, number>;
  
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  selectNode: (nodeId: string | null) => void;
  openModal: (nodeId: string) => void;
  closeModal: () => void;
  setViewMode: (mode: ViewMode) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: string | null) => void;
  initialize: () => Promise<void>;
  refreshDueState: () => Promise<void>;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isModalOpen: false,
  viewMode: 'graph',
  sidebarTab: 'nodes',
  sidebarCollapsed: false,
  searchQuery: '',
  filterCategory: null,
  isInitialized: false,
  dueNodeIds: new Set(),
  nodeRetentions: new Map(),

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
    for (const change of changes) {
      if (change.type === 'position' && change.position) {
        db.positions.put({ nodeId: change.id, x: change.position.x, y: change.position.y });
      }
    }
  },
  
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  openModal: (nodeId) => set({ selectedNodeId: nodeId, isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterCategory: (category) => set({ filterCategory: category }),

  initialize: async () => {
    const count = await db.nodes.count();
    if (count === 0) {
      await db.nodes.bulkAdd(seedNodes);
      for (const pos of seedPositions) {
        await db.positions.put(pos);
      }
    }
    const allNodes = await db.nodes.toArray();
    const positions = await db.positions.toArray();
    const posMap = new Map(positions.map(p => [p.nodeId, { x: p.x, y: p.y }]));
    await initializeCards(allNodes.map(n => n.id));
    const dueIds = await getDueNodeIds();
    const retentions = await getAllRetentions();
    const flowNodes: Node[] = allNodes.map((node, i) => {
      const pos = posMap.get(node.id) || { x: (i % 5) * 280, y: Math.floor(i / 5) * 200 };
      return knowledgeNodeToFlowNode(node, pos, dueIds.has(node.id), retentions.get(node.id) ?? null);
    });
    const flowEdges: Edge[] = [];
    for (const node of allNodes) {
      for (const prereq of node.prerequisites) {
        flowEdges.push(createFlowEdge(prereq, node.id));
      }
    }
    set({ nodes: flowNodes, edges: flowEdges, isInitialized: true, dueNodeIds: dueIds, nodeRetentions: retentions });
  },

  refreshDueState: async () => {
    const dueIds = await getDueNodeIds();
    const retentions = await getAllRetentions();
    const nodes = get().nodes.map(node => ({
      ...node,
      data: { ...node.data, isDue: dueIds.has(node.id), retention: retentions.get(node.id) ?? null },
    }));
    set({ nodes, dueNodeIds: dueIds, nodeRetentions: retentions });
  },
}));
