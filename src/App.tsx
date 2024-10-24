import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useEdgesState,
  addEdge,
  useNodesState,
  Connection,
  BackgroundVariant,
  Node,
  NodeProps,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { AppNode } from './types';
import { initialNodes, initialEdges } from './util';
import { AppCustomNode } from './AppCustomNode';

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(
    initialNodes.map((initialNode) => ({
      ...initialNode,
      data: {
        ...initialNode.data,
        onLabelChange: (label) => {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === initialNode.id
                ? { ...n, data: { ...n.data, label } }
                : n,
            ),
          );
        },
      },
    })),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onAddNode = useCallback(() => {
    const newNode: AppNode = {
      id: `${nodes.length + 1}`,
      data: {
        label: `Node ${nodes.length + 1}`,
        onLabelChange: (label) => {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === newNode.id ? { ...n, data: { ...n.data, label } } : n,
            ),
          );
        },
      },
      position: { x: 0, y: 0 },
      type: 'appNode',
    };

    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes]);

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: AppNode) => {
      const newLabel = prompt('Enter new label:', node.data.label);
      if (newLabel) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, data: { ...n.data, label: newLabel } }
              : n,
          ),
        );
      }
    },
    [setNodes],
  );

  return (
    <div className="w-full h-full p-4 flex flex-col">
      <h1>Workflow Editor</h1>
      <div className="mt-4 flex-auto border border-gray-200 rounded-lg relative">
        <div className="w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDoubleClick={onNodeDoubleClick}
            nodeTypes={{
              appNode: AppCustomNode,
            }}
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        <button
          onClick={onAddNode}
          className="absolute top-4 right-4 w-8 h-8 bg-blue-500 text-white rounded-full items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  );
}
