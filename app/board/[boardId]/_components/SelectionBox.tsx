"use client";

import { memo } from "react";

import { LayerType, Side, XYWH } from "@/types/canvas";
import { useSelf, useStorage } from "@liveblocks/react";
import { useSelectionBounds } from "@/hooks/use-selection-bounds";

interface SelectionBoxProps {
    onResizeHandlePointerDown: (corner: Side, initialBounds: XYWH) => void;
    onSelectionPointerDown: (e: React.PointerEvent) => void;
};

const HANDLE_WIDTH = 8;

export const SelectionBox = memo(({ onResizeHandlePointerDown, onSelectionPointerDown }: SelectionBoxProps) => {
    
    // Get layer
    const soleLayerId = useSelf((me) => 
        me.presence.selection.length ===1 ? me.presence.selection[0] : null
    );

    // Show resize handles only if resizable
    const isShowingHandles = useStorage((root) => 
        soleLayerId && root.layers.get(soleLayerId)?.type !== LayerType.Path
    );

    const bounds = useSelectionBounds();

    if (!bounds) {
        return null;
    }
    
    return (
        <>
            {/* Invisible thicker rect for easier boundary dragging */}
            <rect
                className="fill-none stroke-transparent pointer-events-auto"
                style={{
                    transform: `translate(${bounds.x}px, ${bounds.y}px)`,
                }}
                x={0}
                y={0}
                width={bounds.width}
                height={bounds.height}
                strokeWidth={12} // 12px drag zone around the boundary
                onPointerDown={onSelectionPointerDown}
            />
            
            {/* Visible thin selection rectangle */}
            <rect
                className="fill-none stroke-blue-500 stroke-1 pointer-events-none"
                style={{
                    transform: `translate(${bounds.x}px, ${bounds.y}px)`,
                }}
                x={0}
                y={0}
                width={bounds.width}
                height={bounds.height}
            />

            {/* Adding little rectangles at corners and edges depicting it can be resized */}
            {isShowingHandles && (
                <>
                    <rect
                        className="fill-white stroke-1 stroke-blue-500"
                        x={0}
                        y={0}
                        style={{
                            cursor: "nwse-resize",
                            width: `${HANDLE_WIDTH}px`,
                            height: `${HANDLE_WIDTH}px`,
                            transform: `translate(${bounds.x - HANDLE_WIDTH/2}px, ${bounds.y - HANDLE_WIDTH/2}px)`
                        }}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            onResizeHandlePointerDown(Side.Top + Side.Left, bounds);
                        }}
                    />
                    <rect
                        className="fill-white stroke-1 stroke-blue-500"
                        x={0}
                        y={0}
                        style={{
                            cursor: "nwse-resize",
                            width: `${HANDLE_WIDTH}px`,
                            height: `${HANDLE_WIDTH}px`,
                            transform: `translate(${bounds.x + bounds.width/2 - HANDLE_WIDTH/2}px, ${bounds.y - HANDLE_WIDTH/2}px)`
                        }}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            onResizeHandlePointerDown(Side.Top, bounds);
                        }}
                    />
                    <rect
                        className="fill-white stroke-1 stroke-blue-500"
                        x={0}
                        y={0}
                        style={{
                            cursor: "nwse-resize",
                            width: `${HANDLE_WIDTH}px`,
                            height: `${HANDLE_WIDTH}px`,
                            transform: `translate(${bounds.x + bounds.width - HANDLE_WIDTH/2}px, ${bounds.y - HANDLE_WIDTH/2}px)`
                        }}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            onResizeHandlePointerDown(Side.Top + Side.Right, bounds);
                        }}
                    />
                    <rect
                        className="fill-white stroke-1 stroke-blue-500"
                        x={0}
                        y={0}
                        style={{
                            cursor: "nwse-resize",
                            width: `${HANDLE_WIDTH}px`,
                            height: `${HANDLE_WIDTH}px`,
                            transform: `translate(${bounds.x - HANDLE_WIDTH/2}px, ${bounds.y + bounds.height/2 - HANDLE_WIDTH/2}px)`
                        }}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            onResizeHandlePointerDown(Side.Left, bounds);
                        }}
                    />
                    <rect
                        className="fill-white stroke-1 stroke-blue-500"
                        x={0}
                        y={0}
                        style={{
                            cursor: "nwse-resize",
                            width: `${HANDLE_WIDTH}px`,
                            height: `${HANDLE_WIDTH}px`,
                            transform: `translate(${bounds.x - HANDLE_WIDTH/2}px, ${bounds.y + bounds.height - HANDLE_WIDTH/2}px)`
                        }}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            onResizeHandlePointerDown(Side.Bottom + Side.Left, bounds);
                        }}
                    />
                    <rect
                        className="fill-white stroke-1 stroke-blue-500"
                        x={0}
                        y={0}
                        style={{
                            cursor: "nwse-resize",
                            width: `${HANDLE_WIDTH}px`,
                            height: `${HANDLE_WIDTH}px`,
                            transform: `translate(${bounds.x + bounds.width - HANDLE_WIDTH/2}px, ${bounds.y + bounds.height/2 - HANDLE_WIDTH/2}px)`
                        }}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            onResizeHandlePointerDown(Side.Right, bounds);
                        }}
                    />
                    <rect
                        className="fill-white stroke-1 stroke-blue-500"
                        x={0}
                        y={0}
                        style={{
                            cursor: "nwse-resize",
                            width: `${HANDLE_WIDTH}px`,
                            height: `${HANDLE_WIDTH}px`,
                            transform: `translate(${bounds.x + bounds.width - HANDLE_WIDTH/2}px, ${bounds.y + bounds.height - HANDLE_WIDTH/2}px)`
                        }}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            onResizeHandlePointerDown(Side.Bottom + Side.Right, bounds);
                        }}
                    />
                    <rect
                        className="fill-white stroke-1 stroke-blue-500"
                        x={0}
                        y={0}
                        style={{
                            cursor: "nwse-resize",
                            width: `${HANDLE_WIDTH}px`,
                            height: `${HANDLE_WIDTH}px`,
                            transform: `translate(${bounds.x + bounds.width/2 - HANDLE_WIDTH/2}px, ${bounds.y + bounds.height - HANDLE_WIDTH/2}px)`
                        }}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            onResizeHandlePointerDown(Side.Bottom, bounds);
                        }}
                    />
                </>
            )}
        </>
    );
});

SelectionBox.displayName = "SelectionBox";