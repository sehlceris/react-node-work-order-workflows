import { Node } from '@xyflow/react';

export type AppNodeData = {
  label: string;
  isComplete?: boolean;
  onLabelChange?: (label: string) => void;
  onStatusChange?: (isComplete: boolean) => void;
  onDelete?: () => void;
};

export type AppNode = Node<AppNodeData>;
