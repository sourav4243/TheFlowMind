import { Kalam } from "next/font/google";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

import { cn, colorToCss } from "@/lib/utils";
import { TextLayer } from "@/types/canvas";
import { useMutation } from "@liveblocks/react";
import { useEffect, useLayoutEffect, useRef } from "react";

const font = Kalam({
    subsets: ["latin"],
    weight: ["400"],
});

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
    const { x, y, width, height, fill, value, fontFamily, fontSize } = layer;

    const innerRef = useRef<HTMLElement>(null);

    const updateValue = useMutation((
        { storage },
        newValue: string,
    ) => {
        const liveLayers = storage.get("layers");

        liveLayers.get(id)?.set("value", newValue);
    }, []);

    const updateHeight = useMutation((
        { storage },
        newHeight: number,
    ) => {
        const liveLayers = storage.get("layers");
        const layer = liveLayers.get(id);
        if (layer && layer.get("height") !== newHeight) {
            layer.update({ height: newHeight });
        }
    }, [id]);

    const handleContentChange = (e: ContentEditableEvent) => {
        updateValue(e.target.value);
    };

    useEffect(() => {
        if (innerRef.current) {
            const el = innerRef.current;
            if (el.scrollHeight && Math.abs(el.scrollHeight - height) > 1) {
                updateHeight(el.scrollHeight);
            }
        }
    });

    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            if (selectionColor && innerRef.current) {
                // If selected immediately on mount, the local user just created it.
                // We use a short polling interval to guarantee focus. This overcomes race conditions 
                // like canvas pointerup events, height auto-expansion re-renders, and liveblocks syncs
                // that notoriously steal or reset focus.
                const el = innerRef.current;
                let attempts = 0;
                const interval = setInterval(() => {
                    if (document.activeElement !== el) {
                        el.focus();
                    }
                    const selection = window.getSelection();
                    if (selection) {
                        selection.removeAllRanges();
                        const range = document.createRange();
                        range.selectNodeContents(el);
                        range.collapse(false);
                        selection.addRange(range);
                    }
                    attempts++;
                    if (attempts > 5) {
                        clearInterval(interval);
                    }
                }, 20);

                return () => clearInterval(interval);
            }
        }
    }, [selectionColor]);

    return (
        <foreignObject
            x={x}
            y={y}
            width={width}
            height={height}
            onPointerDown={(e) => {
                if (selectionColor) {
                    e.stopPropagation();
                } else {
                    onPointerDown(e, id);
                }
            }}
            style={{
                outline: selectionColor? `1px solid ${selectionColor}` : "none"
            }}
        >
            <ContentEditable
                innerRef={innerRef as any}
                html={value || "Text"}
                onChange={handleContentChange}
                className={cn(
                    "w-full drop-shadow-md outline-none px-1 py-2 break-words whitespace-pre-wrap",
                    (!fontFamily || fontFamily === "Kalam") ? font.className : ""
                )}
                style={{
                    fontSize: fontSize || 16,
                    fontFamily: (fontFamily && fontFamily !== "Kalam") ? fontFamily : undefined,
                    color: fill? colorToCss(fill): "#000",
                }}
            />
        </foreignObject>
    )
}