import React from "react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "@xyflow/react";
import type { Edge, EdgeProps } from "@xyflow/react";
import useStore from "./builder-store";
import { CiSquarePlus } from "react-icons/ci";
import { Button } from "@tremor/react";
import '@xyflow/react/dist/style.css';

interface CustomEdgeProps extends EdgeProps {
  label?: string;
  type?: string;
  data?: any;
}

const CustomEdge: React.FC<CustomEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  source,
  target,
  data,
  style,
  s
}: CustomEdgeProps) => {
  const { deleteEdges, edges, setSelectedEdge, selectedEdge } = useStore();

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

  // const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
  //   e.stopPropagation();
  //   e.preventDefault();
  //   deleteEdges(id);
  // };


  let dynamicLabel = label; 
  const isLayouted = !!data?.isLayouted;

  console.log("style=======>", id, style)

  const color = dynamicLabel === "True" ? "left-0 bg-green-500" : dynamicLabel === "False" ? "bg-red-500" : "bg-orange-500";
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        // className="stroke-gray-700 stroke-2" // Tailwind class for edge color and thickness
        style={{ opacity: isLayouted ? 1 : 0,
          ...style,
          strokeWidth: 2,
         }}

      />
      <defs>
        <marker
          id={`arrow-${id}`}
          markerWidth="15"
          markerHeight="15"
          refX="10"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M 0,0 L 10,5 L 0,10 L 3,5 Z"
            fill="currentColor"
            className="text-gray-500 font-extrabold" // Tailwind class for arrow color
            style={{ opacity: isLayouted ? 1 : 0 }}
          />
        </marker>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        className="stroke-gray-700 stroke-2"
        style={{
          markerEnd: `url(#arrow-${id})`,
          opacity: isLayouted ? 1 : 0
        }} // Add arrowhead
      />
      <EdgeLabelRenderer>
        {!!dynamicLabel && (
          <div
            className={`absolute ${color} text-white rounded px-3 py-1 border border-gray-700`}
            style={{
              transform: `translate(${midpointX}px, ${midpointY}px)`,
              pointerEvents: "none",
              opacity: isLayouted ? 1 : 0
            }}
          >
            {dynamicLabel}
          </div>
        )}
        <Button
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
            opacity: isLayouted ? 1 : 0
          }}
          className={`p-0 m-0 bg-transparent text-transparent border-none${selectedEdge === id ? " border-2" : ""}`}
          // tooltip="Add node"
          onClick={(e) => {
            setSelectedEdge(id);
          }}
        >
          <CiSquarePlus className={`w-6 h-6 bg-gray-400 text-white text-center ${selectedEdge === id ? " bg-gray-600" : ""} hover:bg-gray-600`} />
        </Button>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;