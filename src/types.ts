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
  updateNodeActiveStatus: () => void;
  deleteNode: (nodeId: string) => void;
};
