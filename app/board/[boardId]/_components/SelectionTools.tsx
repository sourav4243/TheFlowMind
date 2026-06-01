"use client";

import { memo } from "react";
import { BringToFront, SendToBack, Trash2 } from "lucide-react";

import { Hint } from "@/components/Hint";
import { Camera, Color } from "@/types/canvas";
import { Button } from "@/components/ui/button";
import { useSelf, useMutation } from "@liveblocks/react";
import { useDeleteLayers } from "@/hooks/use-delete-layers";
import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { ColorPicker } from "./ColorPicker";

interface SelectionToolsProps {
    camera: Camera;
    setLastUsedColor: (color: Color) => void;
};

export const SelectionTools = memo(({
    camera, 
    setLastUsedColor,
}: SelectionToolsProps) => {
    const selection = useSelf((me) => me.presence.selection);

    const sendBackward = useMutation(({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const arr = liveLayerIds.toImmutable();

        if (!selection || selection.length === 0) return;

        // single selection
        // if (selection.length === 1) {
        //     let selectedIndex = -1;
        //     for (let i = arr.length - 1; i >= 0; i--) {
        //         if (arr[i] === selection[0]) {
        //             selectedIndex = i;
        //             break;
        //         }
        //     }
        //     if (selectedIndex > 0) {
        //         liveLayerIds.move(selectedIndex, selectedIndex - 1);
        //     }
        //     return;
        // }

        // multiple selection
        const indices: number[] = [];
        for (let i = 0; i < arr.length; i++) {
            if (selection.includes(arr[i])) {
                indices.push(i);
            }
        }
        for (let i = 0; i < indices.length; i++) {
            liveLayerIds.move(indices[i], i);
        }
    }, [selection]);

    const bringForward = useMutation(({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const arr = liveLayerIds.toImmutable();

        if (!selection || selection.length === 0) return;

        // single selection
        // if (selection.length === 1) {
        //     let selectedIndex = -1;
        //     for (let i = 0; i < arr.length; i++) {
        //         if (arr[i] === selection[0]) {
        //             selectedIndex = i;
        //             break;
        //         }
        //     }
        //     if (selectedIndex !== -1 && selectedIndex < arr.length - 1) {
        //         liveLayerIds.move(selectedIndex, selectedIndex + 1);
        //     }
        //     return;
        // }

        // multiple selection
        const indices: number[] = [];
        for (let i = 0; i < arr.length; i++) {
            if (selection.includes(arr[i])) {
                indices.push(i);
            }
        }
        for (let i = indices.length - 1; i >= 0; i--) {
            liveLayerIds.move(indices[i], arr.length - 1 - (indices.length - 1 - i));
        }
    }, [selection]);


    const setFill = useMutation((
        { storage },
        fill: Color,
    ) => {
        const liverLayers = storage.get("layers");
        setLastUsedColor(fill);

        selection?.forEach((id) => {    // IF any ERROR, LOOK FOR THIS PLACE
            liverLayers.get(id)?.set("fill", fill);
        });
    }, [selection, setLastUsedColor]);

    const deleteLayers = useDeleteLayers();

    const selectionBounds = useSelectionBounds();

    if (!selectionBounds) {
        return null;
    }

    const scale = camera.scale || 1;
    const x = (selectionBounds.width / 2 + selectionBounds.x) * scale + camera.x;
    const y = selectionBounds.y * scale + camera.y;

    return (
        <div 
            className="absolute top-0 left-0 p-3 rounded-xl bg-white shadow-sm border border-neutral-200 flex select-none items-center"
            style={{
                transform: `translate(
                    calc(${x}px - 50%),
                    calc(${y-16}px - 100%)            
                )`
            }}    
        >
            <ColorPicker onChange={setFill} />
            <div className="flex flex-col gap-y-0.5 pl-2 ml-2 border-l border-neutral-200">
                <Hint label="Bring to front">
                    <Button
                        variant="board"
                        size="icon"
                        onClick={bringForward}
                    >
                        <BringToFront/>
                    </Button>
                </Hint>
                <Hint label="Send to back">
                    <Button
                        variant="board"
                        size="icon"
                        onClick={sendBackward}
                    >
                        <SendToBack/>
                    </Button>
                </Hint>

            </div>

            <div className="flex items-center pl-2 ml-2 border-l border-neutral-200">
                <Hint label="Delete">
                    <Button
                        variant="board"
                        size="icon"
                        onClick={deleteLayers}
                    >
                        <Trash2/>
                    </Button>
                </Hint>

            </div>
        </div>
    )
});

SelectionTools.displayName = "SelectionTools";