"use client";

import { memo, useEffect, useState } from "react";
import { Bold, Italic, Underline, List } from "lucide-react";
import { Hint } from "@/components/Hint";
import { Button } from "@/components/ui/button";
import { useSelf, useStorage, useMutation } from "@liveblocks/react";
import { CanvasMode, CanvasState, Color, LayerType } from "@/types/canvas";
import { colorToCss } from "@/lib/utils";
import { PenColorPicker } from "./ColorPicker";

interface TextToolbarProps {
    canvasState: CanvasState;
    lastUsedColor: Color;
    setLastUsedColor: (color: Color) => void;
}

export const TextToolbar = memo(({
    canvasState,
    lastUsedColor,
    setLastUsedColor,
}: TextToolbarProps) => {
    const selection = useSelf((me) => me.presence.selection);
    
    // We only need the type of the selected layer to determine visibility
    const selectedLayerId = selection && selection.length === 1 ? selection[0] : null;
    const selectedLayerType = useStorage((root) => 
        selectedLayerId ? root.layers.get(selectedLayerId)?.type : null
    );

    // Get current font settings from layer
    const fontFamily = useStorage((root) => {
        if (!selectedLayerId) return undefined;
        const layer = root.layers.get(selectedLayerId);
        if (layer?.type === LayerType.Text) {
            return layer.fontFamily;
        }
        return undefined;
    });
    
    const fontSize = useStorage((root) => {
        if (!selectedLayerId) return undefined;
        const layer = root.layers.get(selectedLayerId);
        if (layer?.type === LayerType.Text) {
            return layer.fontSize;
        }
        return undefined;
    });

    const isTextMode = canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Text;
    const isTextLayerSelected = selectedLayerType === LayerType.Text;

    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isList, setIsList] = useState(false);

    useEffect(() => {
        const handleSelectionChange = () => {
            setIsBold(document.queryCommandState("bold"));
            setIsItalic(document.queryCommandState("italic"));
            setIsUnderline(document.queryCommandState("underline"));
            setIsList(document.queryCommandState("insertUnorderedList"));
        };

        document.addEventListener("selectionchange", handleSelectionChange);
        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange);
        };
    }, []);

    const updateLayerFont = useMutation(({ storage }, key: "fontFamily" | "fontSize", value: any) => {
        if (!selectedLayerId) return;
        const liveLayers = storage.get("layers");
        const layer = liveLayers.get(selectedLayerId);
        if (layer) {
            layer.update({ [key]: value });
        }
    }, [selectedLayerId]);

    if (!isTextMode && !isTextLayerSelected) {
        return null;
    }

    // Command executor for rich text
    const formatText = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        // Force immediate UI update for active states
        setIsBold(document.queryCommandState("bold"));
        setIsItalic(document.queryCommandState("italic"));
        setIsUnderline(document.queryCommandState("underline"));
        setIsList(document.queryCommandState("insertUnorderedList"));
    };

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 p-2 rounded-xl bg-white shadow-md border border-neutral-200 flex select-none items-center gap-x-2">
            {/* Native Color Picker */}
            <div className="relative flex items-center justify-center">
                <input
                    type="color"
                    id="nativeColorPicker"
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    value={colorToCss(lastUsedColor)}
                    onChange={(e) => {
                        const hex = e.target.value;
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        setLastUsedColor({ r, g, b });
                    }}
                />
                <div 
                    className="w-8 h-8 rounded-full border-2 border-neutral-200 pointer-events-none"
                    style={{ backgroundColor: colorToCss(lastUsedColor) }}
                />
            </div>

            <div className="h-8 w-px bg-neutral-200 mx-1" />

            {/* Font Options */}
            <select 
                className="h-8 px-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                onChange={(e) => updateLayerFont('fontFamily', e.target.value)}
                value={fontFamily || "Kalam"}
            >
                <option value="Kalam">Kalam</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
            </select>

            <select 
                className="h-8 px-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                onChange={(e) => updateLayerFont('fontSize', Number(e.target.value))}
                value={fontSize || 16}
            >
                <option value={10}>10px</option>
                <option value={13}>13px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
                <option value={24}>24px</option>
                <option value={32}>32px</option>
                <option value={48}>48px</option>
            </select>

            <div className="h-8 w-px bg-neutral-200 mx-1" />

            {/* Formatting Options */}
            <Hint label="Bold">
                <Button variant="board" size="icon" onPointerDown={(e) => e.preventDefault()} onClick={() => formatText('bold')} className={isBold ? "bg-neutral-200" : ""}>
                    <Bold className="w-4 h-4" />
                </Button>
            </Hint>

            <Hint label="Italic">
                <Button variant="board" size="icon" onPointerDown={(e) => e.preventDefault()} onClick={() => formatText('italic')} className={isItalic ? "bg-neutral-200" : ""}>
                    <Italic className="w-4 h-4" />
                </Button>
            </Hint>

            <Hint label="Underline">
                <Button variant="board" size="icon" onPointerDown={(e) => e.preventDefault()} onClick={() => formatText('underline')} className={isUnderline ? "bg-neutral-200" : ""}>
                    <Underline className="w-4 h-4" />
                </Button>
            </Hint>

            {/* <div className="h-8 w-px bg-neutral-200 mx-1" /> */}

            {/* List Options */}
            {/* Removed Bullet List as requested */}
        </div>
    );
});

TextToolbar.displayName = "TextToolbar";
