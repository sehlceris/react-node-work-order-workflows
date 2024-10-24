import { NodeProps } from '@xyflow/react';
import { AppNode } from './types';

export const CustomNode = ({ id, data }: NodeProps<AppNode>) => (
  <div className="relative bg-white border border-gray-300 rounded p-2">
    <button
      className="absolute top-0 right-0 text-red-500 font-bold"
      onClick={() => data.onRemove?.(id)}
    >
      X
    </button>
    {data.label}
  </div>
);
