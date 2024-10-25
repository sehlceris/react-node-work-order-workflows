import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  OnConnectEnd,
} from '@xyflow/react';

import { type AppState, AppNode } from './types';
import { createNode } from './util';

export const useStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as AppNode[],
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  setNodes: (updater) => {
    set((state) => ({
      nodes: typeof updater === 'function' ? updater(state.nodes) : updater,
    }));
  },
  setEdges: (updater) => {
    set((state) => ({
      edges: typeof updater === 'function' ? updater(state.edges) : updater,
    }));
  },
  onStatusChange: (nodeId: string, isComplete: boolean) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, isComplete, isActive: false } }
          : { ...node, data: { ...node.data, isActive: false } },
      ),
    }));
  },
}));
