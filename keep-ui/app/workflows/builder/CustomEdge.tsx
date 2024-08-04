import React from "react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "@xyflow/react";
import type { Edge, EdgeProps } from "@xyflow/react";
import useStore from "./builder-store";

interface CustomEdgeProps extends EdgeProps {
  label?: string;
  type?: string;
}

const CustomEdge:React.FC<CustomEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  source,
  target,
}: CustomEdgeProps) => {
  const { deleteEdges, getNodeById, edges, updateEdge } = useStore();

  // Calculate the path and midpoint
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 10,
  });

  const midpointX = (sourceX + targetX) / 2;
  const midpointY = (sourceY + targetY) / 2;

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    deleteEdges(id);
  };

  const sourceNode = getNodeById(source);
  const targetNode = getNodeById(target);

  let dynamicLabel = label;
  const componentType = sourceNode?.data?.componentType || "";
  if (!dynamicLabel && sourceNode && targetNode && componentType == "switch") {
    const existEdge = edges?.find(
      ({ source, id: edgeId }: Edge) =>
        edgeId !== id && source === sourceNode.id
    );

    if (!existEdge) {
      dynamicLabel = "True";
      updateEdge(id, "label", dynamicLabel);
    }
    if (existEdge && existEdge.label) {
      dynamicLabel = existEdge.label === "True" ? "False" : "True";
      updateEdge(id, "label", dynamicLabel);
    }
  }
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        className="stroke-gray-700 stroke-2" // Tailwind class for edge color and thickness
      />
      <defs>
        <marker
          id={`arrow-${id}`}
          markerWidth="10"
          markerHeight="10"
          refX="10"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M 0,0 L 10,5 L 0,10 L 3,5 Z"
            fill="currentColor"
            className="text-gray-700" // Tailwind class for arrow color
          />
        </marker>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        className="stroke-gray-700 stroke-2"
        style={{ markerEnd: `url(#arrow-${id})` }} // Add arrowhead
      />
      <EdgeLabelRenderer>
        {!!dynamicLabel && (
          <div
            className="absolute bg-orange-500 text-white rounded px-3 py-1 border border-orange-300"
            style={{
              transform: `translate(${midpointX}px, ${midpointY}px)`,
              pointerEvents: "none",
            }}
          >
            {dynamicLabel}
          </div>
        )}
        <button
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="text-red-500 hover:text-red-700 focus:outline-none"
          onClick={handleDelete}
        >
          ❌ {/* Unicode for delete icon */}
        </button>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;