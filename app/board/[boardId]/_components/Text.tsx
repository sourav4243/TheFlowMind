import { Kalam } from "next/font/google";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

import { cn, colorToCss } from "@/lib/utils";
import { TextLayer } from "@/types/canvas";
import { useMutation } from "@liveblocks/react";

const font = Kalam({
    subsets: ["latin"],
    weight: ["400"],
});

const calculateFontSizeBasedOnBoxSize = (width: number, height: number, text: string) => {
    const maxFontSize = 96;
    const minFontSize = 10;
    const scaleFactor = 0.5;
    
    const fontSizeBasedOnDimensions = Math.min(width, height) * scaleFactor;
    
    const strippedText = text ? text.replace(/<[^>]*>?/gm, '') : "";
    const charCount = Math.max(strippedText.length, 1);
    
    const fontSizeBasedOnArea = Math.sqrt((width * height) / (charCount * 0.72));

    const scaled = Math.min(fontSizeBasedOnDimensions, fontSizeBasedOnArea);
    return Math.min(maxFontSize, Math.max(minFontSize, scaled));
};

interface TextProps {
    id: string;
    layer: TextLayer;
    onPointerDown: (e: React.PointerEvent, id: string ) => void;
    selectionColor?: string;
};

export const Text = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}: TextProps) => {
    const { x, y, width, height, fill, value } = layer;

    const updateValue = useMutation((
        { storage },
        newValue: string,
    ) => {
        const liveLayers = storage.get("layers");

        liveLayers.get(id)?.set("value", newValue);
    }, []);

    const handleContentChange = (e: ContentEditableEvent) => {
        updateValue(e.target.value);
    };

    return (
        <foreignObject
            x={x}
            y={y}
            width={width}
            height={height}
            onPointerDown={(e) =>  onPointerDown(e, id)}
            style={{
                outline: selectionColor? `1px solid ${selectionColor}` : "none"
            }}
        >
            <ContentEditable
                html={value || "Text"}
                onChange={handleContentChange}
                className={cn(
                    "h-full w-full drop-shadow-md outline-none text-center px-1 py-2",
                    font.className
                )}
                style={{
                    fontSize: calculateFontSizeBasedOnBoxSize(width, height, value || "Text"),
                    color: fill? colorToCss(fill): "#000",
                }}
            />
        </foreignObject>
    )
}