import { colorToCss } from "@/lib/utils";
import { EllipseLayer } from "@/types/canvas";

interface EllipseProps {
    id: string;
    layer: EllipseLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
};

export const Ellipse = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}: EllipseProps) => {
    const { transparent, fill } = layer;
    const isTransparent = transparent === true;
    const fillColor = fill ? colorToCss(fill) : "#000";
    const transparentFill = fill ? `rgba(${fill.r}, ${fill.g}, ${fill.b}, 0.15)` : "rgba(0,0,0,0.15)";

    return (
        <ellipse
            className="drop-shadow-md"
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                transform: `translate(${layer.x}px, ${layer.y}px)`
            }}
            cx={layer.width/2}
            cy={layer.height/2}
            rx={layer.width/2}
            ry={layer.height/2}
            fill={isTransparent ? transparentFill : fillColor}
            stroke={selectionColor || (isTransparent ? fillColor : "transparent")}
            strokeWidth={isTransparent ? 2 : 1}
        />
    )
}