import getStroke from "perfect-freehand";

import { getSvgPathFromStroke } from "@/lib/utils";

interface PathProps {
    x: number;
    y: number;
    points: number[][];
    fill: string;
    onPointerDown?: (e: React.PointerEvent) => void;
    stroke?: string;
    penSize?: number;
};

export const Path = ({
    x,
    y,
    points,
    fill,
    onPointerDown, 
    stroke,
    penSize = 8,
}: PathProps) => {
    return (
        <path
            className="drop-shadow-md"
            onPointerDown={onPointerDown}
            d={getSvgPathFromStroke(
                getStroke(points, {
                    size: penSize,
                    thinning: 0.5,
                    smoothing: 0.5, 
                    streamline: 0.2,
                })
            )}
            style={{
                transform: `translate(${x}px, ${y}px)`,
            }}
            x={x}
            y={y}
            fill={fill}
            stroke={stroke}
            strokeWidth={1}
        />
    );
};