"use client";

import { memo } from "react";

import { colorToCss } from "@/lib/utils";
import { LayerType } from "@/types/canvas";
import { useStorage } from "@liveblocks/react";

import { Rectangle } from "./Rectangle";
import { Ellipse } from "./Ellipse";
import { Text } from "./Text";
import { Note } from "./Note";
import { Path } from "./Path";

interface LayerPreviewProps {
    id: string;
    onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
    selectionColor?: string;
};

export const LayerPreview = memo(({
    id,
    onLayerPointerDown, 
    selectionColor,
}:LayerPreviewProps) => {

    const layer = useStorage((root) => root.layers.get(id));

    if(!layer) {
        return null;
    }

    // Render based on type of layer
    switch (layer.type) {
        case LayerType.Path:
            return (
                <Path
                    key={id}
                    x={layer.x}
                    y={layer.y}
                    fill={layer.fill ? colorToCss(layer.fill) : "#000"}
                    points={layer.points}
                    onPointerDown={(e) => onLayerPointerDown(e, id)}
                    stroke={selectionColor}
                    penSize={layer.penSize}
                />
            )
        case LayerType.Note:
            return(
                <Note
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            )

        case LayerType.Text:
            return (
                <Text
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            );

        case LayerType.Ellipse:
            return (
                <Ellipse
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            );

        case LayerType.Rectangle:
            return(
                <Rectangle
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}                   
                />
            );
        default:
            console.warn("Unknown layer type");
            return null;
    }
});

LayerPreview.displayName = "LayerPreview";