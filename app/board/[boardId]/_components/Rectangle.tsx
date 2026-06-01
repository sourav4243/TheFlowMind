import { colorToCss } from "@/lib/utils";
import { RectangleLayer } from "@/types/canvas";

interface RectangleProps {
    id: string;
    layer: RectangleLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
};

export const Rectangle = ({
    id, 
    layer,
    onPointerDown, 
    selectionColor,
}: RectangleProps) => {
    const { x, y, width, height, fill, cornerRadius } = layer;

    const isRounded = cornerRadius === 20;
    const fillColor = fill ? colorToCss(fill) : "#000";
    const transparentFill = fill ? `rgba(${fill.r}, ${fill.g}, ${fill.b}, 0.15)` : "rgba(0,0,0,0.15)";

    return (
        <rect
            className="drop-shadow-md"
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                transform: `translate(${x}px, ${y}px)`,
            }}
            x={0}
            y={0}
            rx={cornerRadius !== undefined ? cornerRadius : 5}
            width={width}
            height={height}
            strokeWidth={isRounded ? 2 : 1}
            fill={isRounded ? transparentFill : fillColor}
            stroke={selectionColor || (isRounded ? fillColor : "transparent")}
        />
    )
}