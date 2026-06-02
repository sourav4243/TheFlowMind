import { NoteLayer } from "@/types/canvas";
import { colorToCss } from "@/lib/utils";

interface NoteProps {
    id: string;
    layer: NoteLayer;
    onPointerDown: (e: React.PointerEvent, id: string ) => void;
    selectionColor?: string;
};

export const Note = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}: NoteProps) => {
    const { x, y, width, height, fill } = layer;

    const fillColor = fill ? colorToCss(fill) : "#000";

    // Dynamic Tab Dimensions
    const tabWidth = Math.max(width * 0.42, 40); 
    const tabHeight = Math.max(height * 0.10, 12); 
    
    // Dynamic Body Dimensions
    const bodyHeight = Math.max(0, height - tabHeight);
    
    // Inner Transparent Rounded Rectangle Fill
    const transparentFill = fill ? `rgba(${fill.r}, ${fill.g}, ${fill.b}, 0.15)` : "rgba(0,0,0,0.15)";

    return (
        <g
            style={{
                transform: `translate(${x}px, ${y}px)`,
            }}
            onPointerDown={(e) => onPointerDown(e, id)}
        >
            {/* 1. Large Rectangle (Main Body) */}
            <rect 
                x={0} 
                y={tabHeight} 
                width={width} 
                height={bodyHeight} 
                rx={5}
                fill={fillColor}
                className="drop-shadow-md"
            />
            
            {/* 2. Transparent Rounded Rectangle (Inside) */}
            <rect 
                x={20} 
                y={tabHeight + 40} 
                width={Math.max(0, width - 40)} 
                height={Math.max(0, bodyHeight - 60)} 
                rx={20}
                fill={transparentFill}
                stroke={fillColor}
                strokeWidth={2}
                className="drop-shadow-md"
            />

            {/* 3. Smaller Rectangle (Tab) - Placed over it */}
            <rect 
                x={(width - tabWidth) / 2} 
                y={12} 
                width={tabWidth} 
                height={tabHeight + 8} // Expand slightly down to overlap the body
                rx={5}
                fill={fillColor}
                className="drop-shadow-md"
            />

            {/* Selection Bounding Box */}
            {selectionColor && (
                <rect 
                    x={0} 
                    y={0} 
                    width={width} 
                    height={height} 
                    fill="transparent" 
                    stroke={selectionColor} 
                    strokeWidth={1} 
                />
            )}
        </g>
    )
}