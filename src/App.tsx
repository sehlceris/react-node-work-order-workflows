import { useCallback, useEffect, useState } from 'react';
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
  useReactFlow,
  ReactFlowInstance,
  ReactFlowProvider,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { AppNode } from './types';
import { initialNodes, initialEdges } from './util';
import { AppCustomNode } from './AppCustomNode';

const flowKey = 'react-flow-persistence';

export default function App() {
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { setViewport } = useReactFlow();

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

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );
  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey));

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setEdges, setNodes, setViewport]);

  // save flow upon update
  useEffect(() => {
    onSave();
  }, [nodes, edges, onSave]);

  // restore flow on mount
  useEffect(() => {
    onRestore();
  }, [onRestore]);

  return (
    <div className="w-full h-full p-4 flex flex-col">
      <h1>Workflow Editor</h1>
      <div className="mt-4 flex-auto border border-gray-200 rounded-lg relative">
        <div className="w-full h-full">
          <ReactFlow
            onInit={setRfInstance}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
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
