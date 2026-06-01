"use client";

import { colorToCss } from "@/lib/utils";
import { Color } from "@/types/canvas";

interface ColorPickerProps {
    onChange: (color: Color) => void;
};

const hexToRgb = (hex: string): Color => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
};

export const ColorPicker = ({
    onChange,
}: ColorPickerProps) => {
    return (
        <div
            className="flex flex-wrap gap-2 items-center max-w-[164px]"
        >
            <ColorButton color={{r: 243, g: 82, b: 35}} onClick={onChange}/>
            <ColorButton color={{r: 255, g: 249, b: 177}} onClick={onChange}/>
            <ColorButton color={{r: 68, g: 202, b: 99}} onClick={onChange}/>
            <ColorButton color={{r: 39, g: 142, b: 237}} onClick={onChange}/>
            <ColorButton color={{r: 155, g: 105, b: 245}} onClick={onChange}/>
            <ColorButton color={{r: 252, g: 142, b: 42}} onClick={onChange}/>
            <ColorButton color={{r: 0, g: 0, b: 0}} onClick={onChange}/>
            <ColorButton color={{r: 255, g: 255, b: 255}} onClick={onChange}/>
        </div>      
    );
};

export const PenColorPicker = ({
    onChange,
}: ColorPickerProps) => {
    return (
        <div className="flex flex-col gap-y-2 w-[32px]">
            <div className="grid grid-cols-1 gap-2 items-center">
                <ColorButton color={{r: 243, g: 82, b: 35}} onClick={onChange}/>
                <ColorButton color={{r: 39, g: 142, b: 237}} onClick={onChange}/>
                <ColorButton color={{r: 0, g: 0, b: 0}} onClick={onChange}/>
            </div>
            
            <div className="h-[1px] w-full bg-neutral-200" />
            
            <div className="w-full flex items-center">
                <div 
                    className="w-full h-8 cursor-pointer rounded-md border border-neutral-300 relative overflow-hidden"
                    style={{ background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" }}
                >
                    <input 
                        type="color" 
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        onChange={(e) => onChange(hexToRgb(e.target.value))}
                    />
                </div>
            </div>
        </div>      
    );
};


interface ColorButtonProps {
    onClick: (color: Color) => void;
    color: Color;
};

const ColorButton = ({
    onClick,
    color,
}: ColorButtonProps) => {
    return (
        <button
            className="w-8 h-8 items-center flex justify-center hover:opacity-75 transition"
            onClick={() => onClick(color)}
            >
            <div
                className="w-8 h-8 rounded-md border border-neutral-300"
                style={{backgroundColor: colorToCss(color)}}
            />
        </button>
    );
};