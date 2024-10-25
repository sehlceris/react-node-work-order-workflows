import { Handle, NodeProps, Position } from '@xyflow/react';
import { AppNode } from './types';

interface AppCustomNodeProps extends NodeProps<AppNode> {
  onLabelChange: (id: string, label: string) => void;
  onStatusChange: (id: string, isComplete: boolean) => void;
  onDelete: (id: string) => void;
}

export const AppCustomNode = ({
  id,
  data,
  onLabelChange,
  onStatusChange,
  onDelete,
}: AppCustomNodeProps) => (
  <div
    className={`relative bg-white border-8 rounded p-2 ${
      data.isActive ? 'border-yellow-400' : 'border-gray-300'
    }`}
  >
    <input
      type="text"
      value={data.label}
      onChange={(evt) => onLabelChange?.(id, evt.target.value)}
    />
    <div className="controls flex justify-between mt-2">
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={data.isComplete}
          onChange={() => onStatusChange?.(id, !data.isComplete)}
        />
        <span className="ml-2">Done</span>
      </label>
      <button className="text-red-500" onClick={() => onDelete?.(id)}>
        Delete
      </button>
    </div>
    <Handle type="target" position={Position.Left} id={`${id}-target`} />
    <Handle type="source" position={Position.Right} id={`${id}-source`} />
  </div>
);
