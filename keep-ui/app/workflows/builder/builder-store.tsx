import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Edge,
  Node,
} from "@xyflow/react";

import { processStepV2, handleNextEdge, processWorkflowV2 } from "utils/reactFlow";

export type V2Properties = Record<string, any>;

export type V2Step = {
  id: string;
  name?: string;
  componentType: string;
  type: string;
  properties?: V2Properties;
  branches?: {
    true?: V2Step[];
    false?: V2Step[];
  };
  sequence?: V2Step[] | V2Step;
};

export type NodeData = Node["data"] & Record<string, any>;

export type NodeStepMeta = { id: string, label?: string };
export type FlowNode = Node & {
  prevStepId?: string | string[];
  edge_label?: string;
  data: NodeData;
  isDraggable?: boolean;
  nextStepId?: string | string[];
  prevStep?: NodeStepMeta[] | NodeStepMeta | null;
  nextStep?: NodeStepMeta[] | NodeStepMeta | null;
  prevNodeId?: string | null;
  nextNodeId?: string | null;
  id:string;
};

const initialNodes: FlowNode[] = [
  {
    id: "a",
    position: { x: 0, y: 0 },
    data: { label: "Node A", type: "custom" },
    type: "custom",
  },
  {
    id: "b",
    position: { x: 0, y: 100 },
    data: { label: "Node B", type: "custom" },
    type: "custom",
  },
  {
    id: "c",
    position: { x: 0, y: 200 },
    data: { label: "Node C", type: "custom" },
    type: "custom",
  },
];

const initialEdges: Edge[] = [
  { id: "a->b", type: "custom-edge", source: "a", target: "b" },
  { id: "b->c", type: "custom-edge", source: "b", target: "c" },
];



export type FlowState = {
  nodes: FlowNode[];
  edges: Edge[];
  selectedNode: string | null;
  v2Properties: V2Properties;
  openGlobalEditor: boolean;
  stepEditorOpenForNode: string | null;
  toolboxConfiguration: Record<string, any>;
  onNodesChange: OnNodesChange<FlowNode>;
  onEdgesChange: OnEdgesChange<Edge>;
  onConnect: OnConnect;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (
    event: React.DragEvent,
    screenToFlowPosition: (coords: { x: number; y: number }) => {
      x: number;
      y: number;
    }
  ) => void;
  setNodes: (nodes: FlowNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  getNodeById: (id: string | null) => FlowNode | undefined;
  hasNode: (id: string) => boolean;
  deleteEdges: (ids: string | string[]) => void;
  deleteNodes: (ids: string | string[]) => void;
  updateNode: (node: FlowNode) => void;
  duplicateNode: (node: FlowNode) => void;
  // addNode: (node: Partial<FlowNode>) => void;
  setSelectedNode: (id: string | null) => void;
  setV2Properties: (properties: V2Properties) => void;
  setOpneGlobalEditor: (open: boolean) => void;
  // updateNodeData: (nodeId: string, key: string, value: any) => void;
  updateSelectedNodeData: (key: string, value: any) => void;
  updateV2Properties: (key: string, value: any) => void;
  setStepEditorOpenForNode: (nodeId: string | null) => void;
  updateEdge: (id: string, key: string, value: any) => void;
  setToolBoxConfig: (config: Record<string, any>) => void;
  addNodeBetween: (nodeOrEdge: string | null, step: V2Step, type: string) => void;
  isLayouted: boolean;
  setIsLayouted: (isLayouted: boolean) => void;
  selectedEdge: string | null;
  setSelectedEdge: (id: string | null) => void;
  getEdgeById: (id: string) => Edge | undefined;
};


export type StoreGet = () => FlowState
export type StoreSet = (state: FlowState | Partial<FlowState> | ((state: FlowState) => FlowState | Partial<FlowState>)) => void

function addNodeBetween(nodeOrEdge: string|null, step: any, type: string, set: StoreSet, get: StoreGet) {
  if (!nodeOrEdge || !step) return;
  let edge = {} as Edge;
  if (type === 'node') {
    edge = get().edges.find((edge) => edge.target === nodeOrEdge) as Edge
  }

  if (type === 'edge') {
    edge = get().edges.find((edge) => edge.id === nodeOrEdge) as Edge;
  }

  const { source: sourceId, target: targetId } = edge || {};
  if (!sourceId || !targetId) return;

  const newNodeId = uuidv4();
  const newStep = { ...step, id: newNodeId }
  let { nodes, edges } = processWorkflowV2([
    { id: sourceId, type: 'temp_node', name: 'temp_node', 'componentType': 'temp_node',
       edgeLabel: edge.label, edgeColor:edge?.style?.stroke},
    newStep,
    { id: targetId, type: 'temp_node', name: 'temp_node', 'componentType': 'temp_node', edgeNotNeeded: true }
  ], { x: 0, y: 0 }, true);
  console.log("new nodes, edges", nodes, edges);
  const newEdges = [
    ...edges,
    ...(get().edges.filter(edge => !(edge.source == sourceId && edge.target == targetId)) || []),
  ];
  set({
    edges: newEdges,
    nodes: [...get().nodes, ...nodes],
    isLayouted: false,
  });
  if (type == 'edge') {
    set({ selectedEdge: edges[edges.length - 1]?.id });
  }

  if (type === 'node') {
    set({ selectedNode: nodeOrEdge });
  }

}

const useStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  v2Properties: {},
  openGlobalEditor: true,
  stepEditorOpenForNode: null,
  toolboxConfiguration: {} as Record<string, any>,
  isLayouted: false,
  selectedEdge: null,
  setSelectedEdge: (id) => set({ selectedEdge: id, selectedNode: null, openGlobalEditor:true }),
  setIsLayouted: (isLayouted) => set({ isLayouted }),
  getEdgeById: (id) => get().edges.find((edge) => edge.id === id),
  addNodeBetween: (nodeOrEdge: string|null, step: any, type: string) => {
    addNodeBetween(nodeOrEdge, step, type, set, get);
  },
  setToolBoxConfig: (config) => set({ toolboxConfiguration: config }),
  setOpneGlobalEditor: (open) => set({ openGlobalEditor: open }),
  updateSelectedNodeData: (key, value) => {
    const currentSelectedNode = get().selectedNode;
    if (currentSelectedNode) {
      const updatedNodes = get().nodes.map((node) =>
        node.id === currentSelectedNode
          ? { ...node, data: { ...node.data, [key]: value } }
          : node
      );
      set({
        nodes: updatedNodes
      });
    }
  },
  setV2Properties: (properties) => set({ v2Properties: properties }),
  updateV2Properties: (key, value) => {
    const updatedProperties = { ...get().v2Properties, [key]: value };
    set({ v2Properties: updatedProperties });
  },
  setSelectedNode: (id) => {
    set({
      selectedNode: id || null,
      openGlobalEditor: false,
      selectedEdge: null
    });
  },
  setStepEditorOpenForNode: (nodeId) => {
    set({ openGlobalEditor: false });
    set({ stepEditorOpenForNode: nodeId });
  },
  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),
  onConnect: (connection) => {
    const { source, target } = connection;
    const sourceNode = get().getNodeById(source);
    const targetNode = get().getNodeById(target);

    // Define the connection restrictions
    const canConnect = (sourceNode: FlowNode | undefined, targetNode: FlowNode | undefined) => {
      if (!sourceNode || !targetNode) return false;

      const sourceType = sourceNode?.data?.componentType;
      const targetType = targetNode?.data?.componentType;

      // Restriction logic based on node types
      if (sourceType === 'switch') {
        return get().edges.filter(edge => edge.source === source).length < 2;
      }
      if (sourceType === 'foreach' || sourceNode?.data?.type === 'foreach') {
        return true;
      }
      return (get().edges.filter(edge => edge.source === source).length === 0);
    };

    // Check if the connection is allowed
    if (canConnect(sourceNode, targetNode)) {
      const edge = { ...connection, type: "custom-edge" };
      set({ edges: addEdge(edge, get().edges) });
      set({
        nodes: get().nodes.map(node => {
          if (node.id === target) {
            return { ...node, prevStepId: source, isDraggable: false };
          }
          if (node.id === source) {
            return { ...node, isDraggable: false };
          }
          return node;
        })
      });
    } else {
      console.warn('Connection not allowed based on node types');
    }
  },

  onDragOver: (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  },
  onDrop: (event, screenToFlowPosition) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      let step: any = event.dataTransfer.getData("application/reactflow");
      if(!step){
        return;
      }
      console.log("step", step);
      step = JSON.parse(step);
      if (!step) return;
      // Use the screenToFlowPosition function to get flow coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newUuid = uuidv4();
      const newNode: FlowNode = {
        id: newUuid,
        type: "custom",
        position, // Use the position object with x and y
        data: {
          label: step.name! as string,
          ...step,
          id: newUuid
        },
        isDraggable: true,
        dragHandle: '.custom-drag-handle',
      };

      set({ nodes: [...get().nodes, newNode] });
    } catch (err) {
      console.error(err);
    }
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  hasNode: (id) => !!get().nodes.find((node) => node.id === id),
  getNodeById: (id) => get().nodes.find((node) => node.id === id),
  deleteEdges: (ids) => {
    const idArray = Array.isArray(ids) ? ids : [ids];
    set({ edges: get().edges.filter((edge) => !idArray.includes(edge.id)) });
  },
  deleteNodes: (ids) => {
    //for now handling only single node deletion. can later enhance to multiple deletions
    if (typeof ids !== 'string') {
      return;
    }
    const idArray = Array.isArray(ids) ? ids : [ids];
    let finalEdges = get().edges.filter((edge) => !idArray.includes(edge.source) && !idArray.includes(edge.target));
    const sources = [...new Set(get().edges.filter((edge) => idArray.includes(edge.target)))];
    const targets = [...new Set(get().edges.filter((edge) => idArray.includes(edge.source)))];
    targets.forEach((edge) => {
      finalEdges = [...finalEdges, ...sources.map((source) => ({ ...edge, source: source.source, id: `e${source.source}-${edge.target}` }))];
    });

    set({
      edges: finalEdges,
      nodes: get().nodes.filter((node) => !idArray.includes(node.id)),
      selectedNode: null,
      isLayouted: false
    });
  },
  updateEdge: (id: string, key: string, value: any) => {
    const edge = get().edges.find((e) => e.id === id);
    if (!edge) return;
    const newEdge = { ...edge, [key]: value };
    set({ edges: get().edges.map((e) => (e.id === edge.id ? newEdge : e)) });
  },
  updateNode: (node) =>
    set({ nodes: get().nodes.map((n) => (n.id === node.id ? node : n)) }),
  duplicateNode: (node) => {
    const { data, position } = node;
    const newUuid = uuidv4();
    const newNode: FlowNode = {
      ...node,
      data: {
        ...data, id: newUuid,
      },
      isDraggable: true,
      id: newUuid,
      position: { x: position.x + 100, y: position.y + 100 },
      dragHandle: '.custom-drag-handle'
    };
    set({ nodes: [...get().nodes, newNode] });
  },
}));

export default useStore;