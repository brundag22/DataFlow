import { create } from 'zustand';
import { type Node, type Edge, applyNodeChanges, applyEdgeChanges, type NodeChange, type EdgeChange } from '@xyflow/react';
import type { KnowledgeNode, ViewMode, SidebarTab } from '../types';
import { db } from '../db/database';
import { initializeCards, getDueNodeIds, getAllRetentions } from '../engine/scheduler';
import { removeLegacySampleNodes } from '../db/legacyCleanup';
import dagre from '@dagrejs/dagre';

function knowledgeNodeToFlowNode(node: KnowledgeNode, position: { x: number; y: number }, isDue: boolean, retention: number | null, isLocked = false): Node {
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
      isLocked,
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
  isEditorOpen: boolean;
  viewMode: ViewMode;
  sidebarTab: SidebarTab;
  sidebarCollapsed: boolean;
  searchQuery: string;
  filterCategory: string | null;
  isInitialized: boolean;
  initializationError: string | null;
  dueNodeIds: Set<string>;
  nodeRetentions: Map<string, number>;
  prerequisiteGateEnabled: boolean;
  
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onNodeDragStop: (node: Node) => Promise<void>;
  autoLayout: () => Promise<void>;
  setPrerequisiteGateEnabled: (enabled: boolean) => Promise<void>;
  selectNode: (nodeId: string | null) => void;
  openModal: (nodeId: string) => void;
  openEditor: (nodeId?: string) => void;
  closeEditor: () => void;
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
  isEditorOpen: false,
  viewMode: 'graph',
  sidebarTab: 'nodes',
  sidebarCollapsed: false,
  searchQuery: '',
  filterCategory: null,
  isInitialized: false,
  initializationError: null,
  dueNodeIds: new Set(),
  nodeRetentions: new Map(),
  prerequisiteGateEnabled: typeof localStorage !== 'undefined' && localStorage.getItem('dataflow-prerequisite-gate') === 'true',

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onNodeDragStop: async (node) => {
    await db.positions.put({ nodeId: node.id, x: node.position.x, y: node.position.y });
  },
  autoLayout: async () => {
    const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    graph.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 120 });
    get().nodes.forEach(node => graph.setNode(node.id, { width: 220, height: 100 }));
    get().edges.forEach(edge => graph.setEdge(edge.source, edge.target));
    dagre.layout(graph);
    const nextNodes = get().nodes.map(node => {
      const position = graph.node(node.id);
      const next = { ...node, position: { x: position.x - 110, y: position.y - 50 } };
      void db.positions.put({ nodeId: node.id, x: next.position.x, y: next.position.y });
      return next;
    });
    set({ nodes: nextNodes });
  },
  setPrerequisiteGateEnabled: async (enabled) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('dataflow-prerequisite-gate', String(enabled));
    set({ prerequisiteGateEnabled: enabled });
    await get().initialize();
  },
  
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  openModal: (nodeId) => set({ selectedNodeId: nodeId, isModalOpen: true }),
  openEditor: (nodeId) => set({ selectedNodeId: nodeId ?? null, isEditorOpen: true, isModalOpen: false }),
  closeEditor: () => set({ isEditorOpen: false }),
  closeModal: () => set({ isModalOpen: false }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterCategory: (category) => set({ filterCategory: category }),

  initialize: async () => {
    try {
      await removeLegacySampleNodes();
      const allNodes = await db.nodes.toArray();
      const positions = await db.positions.toArray();
      const posMap = new Map(positions.map(p => [p.nodeId, { x: p.x, y: p.y }]));
      await initializeCards(allNodes.map(n => n.id));
      const dueIds = await getDueNodeIds();
      const retentions = await getAllRetentions();
      const cards = await db.cards.toArray();
      const cardMap = new Map(cards.map(card => [card.nodeId, card]));
      const flowNodes: Node[] = allNodes.map((node, i) => {
        const pos = posMap.get(node.id) || { x: (i % 5) * 280, y: Math.floor(i / 5) * 200 };
        const isLocked = get().prerequisiteGateEnabled && node.prerequisites.some(id => (cardMap.get(id)?.stability || 0) < 7);
        return knowledgeNodeToFlowNode(node, pos, dueIds.has(node.id), retentions.get(node.id) ?? null, isLocked);
      });
      const flowEdges: Edge[] = allNodes.flatMap(node => node.prerequisites.map(prereq => createFlowEdge(prereq, node.id)));
      set({ nodes: flowNodes, edges: flowEdges, isInitialized: true, initializationError: null, dueNodeIds: dueIds, nodeRetentions: retentions });
    } catch (error) {
      set({ initializationError: error instanceof Error ? error.message : 'Unable to initialize the local database.' });
    }
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
