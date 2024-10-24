import { Node } from '@xyflow/react';

export type AppNodeData = {
  label: string;
  isComplete?: boolean;
  isActive?: boolean;
  onLabelChange?: (id: string, label: string) => void;
  onStatusChange?: (id: string, isComplete: boolean) => void;
  onDelete?: (id: string) => void;
};

export type AppNode = Node<AppNodeData>;
