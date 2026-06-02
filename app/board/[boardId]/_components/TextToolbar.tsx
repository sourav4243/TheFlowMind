"use client";

import { memo } from "react";
import { Bold, Italic, Underline, List, CheckSquare, Type } from "lucide-react";
import { Hint } from "@/components/Hint";
import { Button } from "@/components/ui/button";
import { useSelf, useStorage } from "@liveblocks/react";
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

    const isTextMode = canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Text;
    const isTextLayerSelected = selectedLayerType === LayerType.Text;

    if (!isTextMode && !isTextLayerSelected) {
        return null;
    }

    // Command executor for rich text
    const formatText = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        // Force the content editable to re-render or trigger an onChange
        // We'll rely on the native DOM event bubbling to ContentEditable's onChange
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
                onChange={(e) => formatText('fontName', e.target.value)}
                defaultValue="Kalam"
            >
                <option value="Kalam">Kalam</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
            </select>

            <select 
                className="h-8 px-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                onChange={(e) => formatText('fontSize', e.target.value)}
                defaultValue="3"
            >
                <option value="1">10px</option>
                <option value="2">13px</option>
                <option value="3">16px</option>
                <option value="4">18px</option>
                <option value="5">24px</option>
                <option value="6">32px</option>
                <option value="7">48px</option>
            </select>

            <div className="h-8 w-px bg-neutral-200 mx-1" />

            {/* Formatting Options */}
            <Hint label="Bold">
                <Button variant="board" size="icon" onClick={() => formatText('bold')}>
                    <Bold className="w-4 h-4" />
                </Button>
            </Hint>

            <Hint label="Italic">
                <Button variant="board" size="icon" onClick={() => formatText('italic')}>
                    <Italic className="w-4 h-4" />
                </Button>
            </Hint>

            <Hint label="Underline">
                <Button variant="board" size="icon" onClick={() => formatText('underline')}>
                    <Underline className="w-4 h-4" />
                </Button>
            </Hint>

            <div className="h-8 w-px bg-neutral-200 mx-1" />

            {/* List Options */}
            <Hint label="Bullet List">
                <Button variant="board" size="icon" onClick={() => formatText('insertUnorderedList')}>
                    <List className="w-4 h-4" />
                </Button>
            </Hint>
            
            <Hint label="Check List">
                <Button variant="board" size="icon" onClick={() => formatText('insertHTML', '<input type="checkbox" />&nbsp;')}>
                    <CheckSquare className="w-4 h-4" />
                </Button>
            </Hint>
        </div>
    );
});

TextToolbar.displayName = "TextToolbar";
