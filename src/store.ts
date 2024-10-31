import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Edge,
} from '@xyflow/react';

import { type AppState, AppNode } from './types';

export const useStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  updateNodeActiveStatus: () => {
    const { nodes, edges } = get();
    const updatedNodes = nodes.map((node) => {
      if (node.data.isComplete) return node;

      const dependencies = edges.filter((edge) => edge.target === node.id);
      const allDependenciesComplete = dependencies.every(
        (dep) => nodes.find((n) => n.id === dep.source)?.data.isComplete,
      );

      return {
        ...node,
        data: { ...node.data, isActive: allDependenciesComplete },
      };
    });

    set({ nodes: updatedNodes });
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as AppNode[],
    });
    get().updateNodeActiveStatus();
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
    get().updateNodeActiveStatus();
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
    get().updateNodeActiveStatus();
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
          : node,
      ),
    }));
    get().updateNodeActiveStatus();
  },

  deleteNode: (nodeId: string) => {
    set((state) => {
      // // step: delete invalid edges
      const newNodes = state.nodes.filter((it) => it.id !== nodeId);

      let newEdges = [...state.edges];

      const edgesToAdd: Edge[] = [];

      const allSourceEdges = state.edges.filter((it) => it.target === nodeId);
      const allSourceNodes = allSourceEdges.map((it) => it.source);

      const allTargetEdges = state.edges.filter((it) => it.source === nodeId);
      const allTargetNodes = allTargetEdges.map((it) => it.target);

      const filteredEdges = state.edges.filter(
        (it) => it.source !== nodeId && it.target !== nodeId,
      );

      allSourceNodes.forEach((sourceNode) => {
        allTargetNodes.forEach((targetNode) => {
          const edge: Edge = {
            source: sourceNode,
            target: targetNode,
            id: Math.round(Math.random() * 10000).toString(),
          };

          // o^n3 ??
          const dupeEdge = filteredEdges.find((it) => {
            return it.source === edge.source && it.target === edge.target;
          });

          if (!dupeEdge) {
            edgesToAdd.push(edge);
          }
        });
      });

      newEdges = [...filteredEdges, ...edgesToAdd];

      /*
        TODO: when deleting a node...
        - find all nodes connected to the deleted node's target port
        - find all nodes connected to the deleted node's source port
        - create edges from all source nodes to all target nodes
      */

      const newState = {
        nodes: newNodes,
        edges: newEdges,
      };

      return newState;
    });
    get().updateNodeActiveStatus();
  },
}));
