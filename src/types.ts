import { Node } from '@xyflow/react';

export type AppNodeData = {
  label: string;
  onLabelChange?: (label: string) => void;
};

export type AppNode = Node<AppNodeData>;
