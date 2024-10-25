import {
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react';

export type AppNodeData = {
  label: string;
  isComplete?: boolean;
  isActive?: boolean;
  // onLabelChange?: (id: string, label: string) => void;
  // onStatusChange?: (id: string, isComplete: boolean) => void;
  // onDelete?: (id: string) => void;
};

export type AppNode = Node<AppNodeData>;

export type AppState = {
  nodes: AppNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (updater: AppNode[] | ((nodes: AppNode[]) => AppNode[])) => void;
  setEdges: (updater: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  onStatusChange: (nodeId: string, isComplete: boolean) => void;
};
