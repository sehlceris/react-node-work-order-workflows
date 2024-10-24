import { Node } from '@xyflow/react';
export type AppNode = Node<
  {
    label: string;
    onLabelChange?: (label: string) => void;
  },
  'appNode'
>;
