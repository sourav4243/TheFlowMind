import { Circle, MousePointer2, Pencil, Redo2, Square, StickyNote, Type, Undo2, Eraser } from "lucide-react";

import { ToolButton } from "./ToolButton";
import { ColorPicker, PenColorPicker } from "./ColorPicker";

import { CanvasMode, CanvasState, LayerType, Color } from "@/types/canvas";

interface ToolbarProps {
    canvasState: CanvasState;
    setCanvasState: (newState: CanvasState) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    lastUsedPenSize: number;
    setLastUsedPenSize: (size: number) => void;
    setLastUsedColor: (color: Color) => void;
};

export const Toolbar = ({
    canvasState,
    setCanvasState,
    undo,
    redo,
    canUndo,
    canRedo,
    lastUsedPenSize,
    setLastUsedPenSize,
    setLastUsedColor
}: ToolbarProps) => {
    return (
        <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4">
            <div className="bg-white rounded-md p-1.5 flex flex-col gap-y-1 items-center shadow-md">
                <ToolButton 
                    label="Select"
                    icon={MousePointer2}
                    onClick={() => setCanvasState({mode: CanvasMode.None})}
                    isActive={
                        canvasState.mode === CanvasMode.None ||
                        canvasState.mode === CanvasMode.Translating ||
                        canvasState.mode === CanvasMode.SelectionNet ||
                        canvasState.mode === CanvasMode.Pressing ||
                        canvasState.mode === CanvasMode.Resizing
                    }
                />
                <ToolButton 
                    label="Text"
                    icon={Type}
                    onClick={()  => setCanvasState({
                        mode: CanvasMode.Inserting,
                        layerType: LayerType.Text,
                    })}
                    isActive={
                        canvasState.mode ===  CanvasMode.Inserting &&
                        canvasState.layerType === LayerType.Text
                    }
                />
                <ToolButton 
                    label="Sticky note"
                    icon={StickyNote}
                    onClick={()  => setCanvasState({
                        mode: CanvasMode.Inserting,
                        layerType: LayerType.Note,
                    })}
                    isActive={
                        canvasState.mode === CanvasMode.Inserting &&
                        canvasState.layerType === LayerType.Note
                    }
                />
                <ToolButton 
                    label="Rectangle"
                    icon={Square}
                    onClick={()  => setCanvasState({
                        mode: CanvasMode.Inserting,
                        layerType: LayerType.Rectangle,
                    })}
                    isActive={
                        canvasState.mode === CanvasMode.Inserting &&
                        canvasState.layerType === LayerType.Rectangle
                    }
                />
                <ToolButton 
                    label="Ellipse"
                    icon={Circle}
                    onClick={()  => setCanvasState({
                        mode: CanvasMode.Inserting,
                        layerType: LayerType.Ellipse,
                    })}
                    isActive={
                        canvasState.mode === CanvasMode.Inserting &&
                        canvasState.layerType === LayerType.Ellipse
                    }
                />
                <ToolButton 
                    label="Pen"
                    icon={Pencil}
                    onClick={()  => setCanvasState({
                        mode: CanvasMode.Pencil
                    })}
                    isActive={
                        canvasState.mode === CanvasMode.Pencil
                    }
                />
                <ToolButton 
                    label="Eraser"
                    icon={Eraser}
                    onClick={()  => setCanvasState({
                        mode: CanvasMode.Eraser
                    })}
                    isActive={
                        canvasState.mode === CanvasMode.Eraser
                    }
                />
            </div>

            <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
                <ToolButton 
                    label="Undo"
                    icon={Undo2}
                    onClick={undo}
                    isDisabled={!canUndo}
                />
                <ToolButton 
                    label="Redo"
                    icon={Redo2}
                    onClick={redo}
                    isDisabled={!canRedo}
                />
            </div>
            
            {canvasState.mode === CanvasMode.Pencil && (
                <div className="bg-white rounded-md p-1.5 flex flex-col gap-y-1 items-center shadow-md">
                    <button onClick={() => setLastUsedPenSize(4)} className={`w-6 h-6 rounded-full flex items-center justify-center hover:bg-neutral-100 ${lastUsedPenSize === 4 ? "bg-neutral-200" : ""}`}>
                        <div className="w-1 h-1 bg-black rounded-full" />
                    </button>
                    <button onClick={() => setLastUsedPenSize(8)} className={`w-6 h-6 rounded-full flex items-center justify-center hover:bg-neutral-100 ${lastUsedPenSize === 8 ? "bg-neutral-200" : ""}`}>
                        <div className="w-2 h-2 bg-black rounded-full" />
                    </button>
                    <button onClick={() => setLastUsedPenSize(16)} className={`w-6 h-6 rounded-full flex items-center justify-center hover:bg-neutral-100 ${lastUsedPenSize === 16 ? "bg-neutral-200" : ""}`}>
                        <div className="w-4 h-4 bg-black rounded-full" />
                    </button>
                </div>
            )}

            {canvasState.mode === CanvasMode.Pencil && (
                <div className="absolute left-full ml-2 top-[160px] bg-white rounded-md p-3 shadow-md flex flex-col gap-y-2">
                    <PenColorPicker onChange={setLastUsedColor} />
                </div>
            )}
        </div>
    )
}

export const ToolbarSkeleton = () => {
    return (
        <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4 bg-white h-[360px] w-[52px] shadow-md rounded-md"/>
    );
};