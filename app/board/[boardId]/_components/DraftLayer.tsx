"use client";

import { useSelf } from "@liveblocks/react";
import { Path } from "./Path";
import { colorToCss } from "@/lib/utils";
import { Color } from "@/types/canvas";

interface DraftLayerProps {
    lastUsedColor: Color;
    penSize?: number;
}

export const DraftLayer = ({ lastUsedColor, penSize }: DraftLayerProps) => {
    const pencilDraft = useSelf((me) => me.presence.pencilDraft);

    if (pencilDraft == null || pencilDraft.length === 0) {
        return null;
    }

    return (
        <Path
            x={0}
            y={0}
            points={pencilDraft}
            fill={colorToCss(lastUsedColor)}
            penSize={penSize}
        />
    );
};
