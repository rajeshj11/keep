import React, { memo, useEffect, useState } from "react";
import { Handle, NodeToolbar, Position } from "@xyflow/react";
import NodeMenu from "./NodeMenu";
import useStore, { FlowNode } from "./builder-store";
import Image from "next/image";
import { GoPlus } from "react-icons/go";
import { MdNotStarted } from "react-icons/md";
import { GoSquareFill } from "react-icons/go";
import { PiSquareLogoFill } from "react-icons/pi";


function IconUrlProvider(data: FlowNode["data"]) {
  const { componentType, type } = data || {};
  if (type === "alert" || type === "workflow") return "/keep.png";
  return `/icons/${type
    ?.replace("step-", "")
    ?.replace("action-", "")
    ?.replace("condition-", "")}-icon.png`;
}

function CustomNode({ id, data }: FlowNode) {
  const { selectedNode, setSelectedNode, setOpneGlobalEditor } = useStore();
  const type = data?.type
    ?.replace("step-", "")
    ?.replace("action-", "")
    ?.replace("condition-", "");

  const isEmptyNode = !!data?.type?.includes("empty");
  const isLayouted = !!data?.isLayouted;

  const specialNodeCheck = ['start', 'end'].includes(type)


  return (
    <>
      {!specialNodeCheck && <div
        className={`p-2  py-4 shadow-md rounded-md bg-white border-2 w-full h-full ${id === selectedNode
          ? "border-orange-500"
          : "border-stone-400"
          // } custom-drag-handle`}
          //to make the node draggale uncomment above line and 
          }`}
        onClick={(e) => {
          e.stopPropagation();
          if (type === 'start' || type === 'end' || id?.includes('end')) {
            setSelectedNode(null);
            setOpneGlobalEditor(true);
            return;
          }
          setSelectedNode(id);
        }}
        style={{
          opacity: data.isLayouted ? 1 : 0
        }}
      >
        {isEmptyNode && <div className="flex flex-col items-center justify-center"
        >
          <GoPlus className="w-8 h-8 text-gray-600 font-bold" />
          {selectedNode === id && <div className="text-gray-600 font-bold">Go to Toolbox</div>}
        </div>}
        {!isEmptyNode && data?.type !== "sub_flow" && (
          <div className="flex flex-row items-center justify-between gap-2 flex-wrap">
            <Image
              src={IconUrlProvider(data) || "/keep.png"}
              alt={data?.type}
              className="object-cover w-8 h-8 rounded-full bg-gray-100"
              width={32}
              height={32}
            />
            <div className="flex-1 flex-col gap-2 flex-wrap truncate">
              <div className="text-lg font-bold">{data?.name}</div>
              <div className="text-gray-500 truncate">
                {type || data?.componentType}
              </div>
            </div>
            <div>
              <NodeMenu data={data} id={id} />
            </div>
          </div>
        )}

        <Handle
          type="target"
          position={Position.Top}
          className="w-32"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-32"
        />
      </div>}

      {specialNodeCheck && <div
        style={{
          opacity: data.isLayouted ? 1 : 0
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (type === 'start' || type === 'end' || id?.includes('end')) {
            setSelectedNode(null);
            return;
          }
          setSelectedNode(id);
        }}
      >
        <div className={`flex flex-col items-center justify-center`}>
          {type === 'start' && <MdNotStarted className="size-20 bg-orange-500 text-white rounded-full font-bold mb-2" />}
          {type === 'end' && <GoSquareFill className="size-20 bg-orange-500 text-white rounded-full font-bold mb-2" />}
          {['threshold', 'assert', 'foreach'].includes(type) &&
            <div className={`border-2 ${id === selectedNode
          ? "border-orange-500"
          : "border-stone-400"}`}>
            {id.includes('end') ? <PiSquareLogoFill className="size-20 rounded bg-white-400 p-2" /> :
              <Image
                src={IconUrlProvider(data) || "/keep.png"}
                alt={data?.type}
                className="object-contain size-20 rounded bg-white-400 p-2"
                width={32}
                height={32}
              />}
              </div>
          }

          {['start', 'threshold', 'assert', 'foreach'].includes(type) && <Handle
            type="source"
            position={Position.Bottom}
            className="w-32"
          />}

          {['end', 'threshold', 'assert', 'foreach'].includes(type) && <Handle
            type="target"
            position={Position.Top}
            className="w-32"
          />}


        </div>
      </div>}

    </>
  );
}

export default memo(CustomNode);