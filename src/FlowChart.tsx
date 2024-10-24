import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useEdgesState,
  useNodesState,
  BackgroundVariant,
  useReactFlow,
  ReactFlowInstance,
  Edge,
  addEdge,
  Connection,
  OnConnect,
  ConnectionState,
  OnConnectEnd,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { AppNode } from './types';
import { AppCustomNode } from './AppCustomNode';

const flowKey = 'react-flow-persistence';

export const FlowChart = () => {
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const { setViewport, screenToFlowPosition } = useReactFlow();

  const onAddNode = useCallback(() => {
    const newNode: AppNode = {
      id: `${nodes.length + 1}`,
      type: 'appNode',
      position: { x: 0, y: 0 },
      data: {
        label: `Node ${nodes.length + 1}`,
        onLabelChange: (label: string) => {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === newNode.id ? { ...n, data: { ...n.data, label } } : n,
            ),
          );
        },
      },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes]);

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const storedFlow = localStorage.getItem(flowKey);
      const flow = storedFlow ? JSON.parse(storedFlow) : null;

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        const restoredNodes = flow.nodes.map((node: AppNode) => ({
          ...node,
          data: {
            ...node.data,
            onLabelChange: (label: string) => {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === node.id ? { ...n, data: { ...n.data, label } } : n,
                ),
              );
            },
          },
        }));
        setNodes(restoredNodes);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setEdges, setNodes, setViewport]);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState: ConnectionState) => {
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const id = `${nodes.length + 1}`;
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;
        const newNode: AppNode = {
          id,
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: {
            label: `Node ${id}`,
            onLabelChange: (label: string) => {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === newNode.id
                    ? { ...n, data: { ...n.data, label } }
                    : n,
                ),
              );
            },
          },
          type: 'appNode',
          origin: [0.5, 0.0],
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({ id, source: connectionState.fromNode!.id, target: id }),
        );
      }
    },
    [nodes.length, screenToFlowPosition, setNodes, setEdges],
  );

  // save flow upon update
  useEffect(() => {
    onSave();
  }, [nodes, edges, onSave]);

  // restore flow on mount
  useEffect(() => {
    onRestore();
  }, [onRestore]);

  return (
    <div className="w-full h-full">
      <div className="w-full h-full">
        <ReactFlow
          onInit={setRfInstance}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
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
  );
};
