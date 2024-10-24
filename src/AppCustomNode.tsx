import { Handle, NodeProps, Position } from '@xyflow/react';
import { AppNode } from './types';

export const AppCustomNode = ({ id, data }: NodeProps<AppNode>) => (
  <div className="relative bg-white border border-gray-300 rounded p-2">
    <input
      type="text"
      value={data.label}
      onChange={(evt) => data.onLabelChange?.(evt.target.value)}
    />
    <Handle type="target" position={Position.Left} id={`${id}-target`} />
    <Handle type="source" position={Position.Right} id={`${id}-source`} />
  </div>
);
