"use client";

import { nanoid } from "nanoid";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { LiveObject } from "@liveblocks/node";

import { 
    useHistory, 
    useCanUndo, 
    useCanRedo,
    useMutation,
    useStorage,
    useOthersMapped,
    useSelf,
    useUpdateMyPresence,
} from "@liveblocks/react";
import { colorToCss, connectionIdToColor, findIntersectingLayersWithRectangle, findIntersectingLayersWithLasso, penPointsToPathLayer, pointerEventToCanvasPoint, resizeBounds } from "@/lib/utils";
import { Camera, CanvasMode, CanvasState, Color, Layer, LayerType, Point, Side, XYWH } from "@/types/canvas";
import { useDisableScrollBounce } from "@/hooks/use-disable-scroll-debounce";
import { useDeleteLayers } from "@/hooks/use-delete-layers";

import { Info } from "./Info";
import { Participants } from "./Participants";
import { Toolbar } from "./Toolbar";
import { SelectionTools } from "./SelectionTools";
import { LayerPreview } from "./LayerPreview"; 
import { CursorPresense } from "./CursorsPresense";
import { SelectionBox } from "./SelectionBox";
import { DraftLayer } from "./DraftLayer";


const MAX_LAYERS = 5000;

interface CanvasProps {
    boardId: string;
}

export const Canvas = ({boardId} : CanvasProps) => {

    const layerIds = useStorage((root) => root.layerIds);

    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None,
    })

    const [camera, setCamera] = useState<Camera>({x:0, y:0, scale: 1})

    // Create refs for state to be used in stable callbacks without triggering re-renders
    const cameraRef = useRef(camera);
    const canvasStateRef = useRef(canvasState);
    cameraRef.current = camera;
    canvasStateRef.current = canvasState;
    const [lastUsedPenSize, setLastUsedPenSize] = useState<number>(8);
    const [lastUsedColor, setLastUsedColor] = useState<Color>({
        r: 0,
        g: 0,
        b: 0,
    });
    
    const updateMyPresence = useUpdateMyPresence();

    useDisableScrollBounce();
    const history = useHistory();
    const canUndo = useCanUndo();
    const canRedo = useCanRedo();

    // Function to insert layer on canvas
    const insertLayer = useMutation((
        { storage, setMyPresence }, 
        layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Note,
        position: Point,
        cornerRadius?: number,
    ) => {
        const liveLayers = storage.get("layers");
        if(liveLayers.size >= MAX_LAYERS) {
            return;
        }

        const liveLayerIds = storage.get("layerIds");
        const layerId = nanoid();

        // new layer:
        const layer = new LiveObject({
            type: layerType,
            x: position.x,
            y: position.y,
            // height: layerType === LayerType.Text ? 500: 100,         // We can do like this to add diff size for diff type of layer
            height: 100,
            width: 100,
            fill: lastUsedColor,
            ...(cornerRadius !== undefined ? { cornerRadius } : {}),
        } as Layer)

        liveLayerIds.push(layerId);
        liveLayers.set(layerId, layer);

        setMyPresence({ selection: [layerId] }, { addToHistory: true });
        setCanvasState({ mode: CanvasMode.None });
    }, [lastUsedColor]);


    const onChangeColor = useMutation((
        { storage, self },
        fill: Color,
    ) => {
        setLastUsedColor(fill);
        const liveLayers = storage.get("layers");
        self.presence.selection?.forEach((id) => {
            liveLayers.get(id)?.set("fill", fill);
        });
    }, []);

    // translate layer logic
    const translateSelectedLayer = useMutation((
        { storage, self },
        point: Point,
    ) => {
        if (canvasState.mode !== CanvasMode.Translating) {
            return;
        }

        const offset = {
            x: point.x - canvasState.current.x,
            y: point.y - canvasState.current.y,
        }

        const liveLayers = storage.get("layers");

        for (const id of self.presence.selection) {
            const layer = liveLayers.get(id);

            if (layer) {
                layer.update({
                    x: layer.get("x") + offset.x,
                    y: layer.get("y") + offset.y, 
                })
            }
        }

        setCanvasState({ mode: CanvasMode.Translating, current: point});
    }, [canvasState]);

    const unselectLayers = useMutation((
        {self, setMyPresence}
    ) => {
        if (self.presence.selection.length > 0) {
            setMyPresence({ selection: [] }, { addToHistory: true });
        }
    }, []);


    // apply selection net
    const applySelectionNet = useMutation((
        { storage, setMyPresence },
        current: Point, 
        origin: Point,
    ) => {
        const layers = storage.get("layers").toImmutable();
        const ids = findIntersectingLayersWithRectangle(layerIds, layers, origin, current);
        setMyPresence({ selection: ids });
    }, [layerIds]);

    // apply lasso selection
    const applyLassoSelection = useMutation((
        { storage, setMyPresence },
        points: Point[],
    ) => {
        const layers = storage.get("layers").toImmutable();
        const ids = findIntersectingLayersWithLasso(layerIds, layers, points);
        setMyPresence({ selection: ids });
    }, [layerIds]);

    // update selection net
    const updateSelectionNet = useCallback((
        current: Point, 
        origin: Point,
    ) => {
        setCanvasState({
            mode: CanvasMode.SelectionNet,
            origin: origin, 
            current: current,
        });
    }, []);

    // update lasso selection
    const updateLassoSelection = useCallback((
        current: Point,
    ) => {
        if (canvasStateRef.current.mode !== CanvasMode.LassoSelection) return;
        
        const currentPoints = canvasStateRef.current.points;
        const lastPoint = currentPoints.length > 0 ? currentPoints[currentPoints.length - 1] : null;
        
        // Add point if distance is > 5 to avoid too many points
        if (!lastPoint || Math.abs(current.x - lastPoint.x) + Math.abs(current.y - lastPoint.y) > 5) {
            const newPoints = [...currentPoints, current];
            setCanvasState({
                mode: CanvasMode.LassoSelection,
                points: newPoints,
            });
        }
    }, []);

    // multi layer selection
    const startMultiSelection = useCallback((
        current: Point,
        origin: Point,
    ) => {
        if (Math.abs(current.x-origin.x) + Math.abs(current.y-origin.y) > 5) {
            setCanvasState({
                mode: CanvasMode.SelectionNet,
                origin,
                current,
            });
        }
    }, []);


    // Drawing
    const startDrawing = useMutation((
        { setMyPresence },
        point: Point,
        pressure: number,
    ) => {
        setMyPresence({
            pencilDraft: [[point.x, point.y, pressure]],
            penColor: lastUsedColor
        })
    }, [lastUsedColor]);


    const continueDrawing = useMutation((
        { self, setMyPresence },
        point: Point,
        e: React.PointerEvent,
    ) => {
        const { pencilDraft } = self.presence;

        if (
            canvasState.mode !== CanvasMode.Pencil ||
            e.buttons !== 1 ||
            pencilDraft === null
        ) {
            return;
        }

        setMyPresence({
            cursor: point,
            pencilDraft:
                pencilDraft.length === 1        &&
                pencilDraft[0][0] === point.x   &&
                pencilDraft[0][1] === point.y   ? pencilDraft : [...pencilDraft, [point.x, point.y, e.pressure]]
        })
    }, [canvasState.mode]);

    const insertPath = useMutation((
        { storage, self, setMyPresence }
    ) => {
        const liveLayers = storage.get("layers");
        const { pencilDraft } = self.presence;

        if (pencilDraft == null || pencilDraft.length<2 || liveLayers.size >=MAX_LAYERS) {
            setMyPresence({ pencilDraft: null });
            return;
        }

        const id = nanoid();
        liveLayers.set(
            id,
            new LiveObject({
                ...penPointsToPathLayer(pencilDraft, lastUsedColor),
                penSize: lastUsedPenSize,
            }),
        );

        const liveLayerIds = storage.get("layerIds");
        liveLayerIds.push(id);

        setMyPresence({ pencilDraft: null });
        setCanvasState({ mode: CanvasMode.Pencil });
    }, [lastUsedColor, lastUsedPenSize]);

    // resize logic
    const resizeSelectedLayer = useMutation((
        { storage, self },
        point: Point,
    ) => {
        if (canvasState.mode !== CanvasMode.Resizing) {
            return;
        }

        const bounds = resizeBounds(canvasState.initialBounds, canvasState.corner, point);

        const liveLayers = storage.get("layers");
        const layer = liveLayers.get(self.presence.selection[0]);

        if (layer) {
            layer.update(bounds);
        }
    }, [canvasState]);


    // Called when user presses on a resize handle of selection box
    const onResizeHandlePointerDown = useCallback((
        corner: Side,
        initialBounds: XYWH,
    ) => {

        history.pause();
        setCanvasState({
            mode: CanvasMode.Resizing,
            initialBounds,
            corner,
        });
    }, [history]);

    const eraseIntersecting = useMutation((
        { storage },
        point: Point,
    ) => {
        const liveLayers = storage.get("layers");
        const liveLayerIds = storage.get("layerIds");
        const scale = camera.scale || 1;
        const eraserSize = 10 / scale;
        const origin = { x: point.x - eraserSize, y: point.y - eraserSize };
        const current = { x: point.x + eraserSize, y: point.y + eraserSize };
        
        const intersectingIds = findIntersectingLayersWithRectangle(
            liveLayerIds.toArray(),
            liveLayers.toImmutable(),
            origin,
            current
        );
        
        if (intersectingIds && intersectingIds.length > 0) {
            for (const id of intersectingIds) {
                liveLayers.delete(id);
                const index = liveLayerIds.indexOf(id);
                if (index !== -1) {
                    liveLayerIds.delete(index);
                }
            }
        }
    }, [camera.scale]);

    const onWheel = useCallback((e: React.WheelEvent) => {
        setCamera((camera) => {
            const scaleAdjust = e.deltaY * -0.001;
            const newScale = Math.min(Math.max((camera.scale || 1) + scaleAdjust, 0.1), 5); 
            
            const canvasPointX = (e.clientX - camera.x) / (camera.scale || 1);
            const canvasPointY = (e.clientY - camera.y) / (camera.scale || 1);
            
            return {
                x: e.clientX - canvasPointX * newScale,
                y: e.clientY - canvasPointY * newScale,
                scale: newScale
            };
        });
    }, []);

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        e.preventDefault();

        const current = pointerEventToCanvasPoint(e, camera)
        if (canvasState.mode === CanvasMode.Pressing) {
            startMultiSelection(current, canvasState.origin);
        } else if (canvasState.mode === CanvasMode.SelectionNet) {
            updateSelectionNet(current, canvasState.origin);
        } else if (canvasState.mode === CanvasMode.Translating) {
            translateSelectedLayer(current);
        } else if (canvasState.mode === CanvasMode.Resizing) {
            resizeSelectedLayer(current);
        } else if (canvasState.mode === CanvasMode.Eraser) {
            if (e.buttons === 1) {
                eraseIntersecting(current);
            }
        } else if (canvasState.mode === CanvasMode.Pencil) {
            continueDrawing(current, e);
        } else if (canvasState.mode === CanvasMode.LassoSelection) {
            if (e.buttons === 1) {
                updateLassoSelection(current);
            }
        } else if (canvasState.mode === CanvasMode.TranslatingCamera) {
            setCamera((camera) => ({
                x: camera.x + e.movementX,
                y: camera.y + e.movementY,
                scale: camera.scale
            }));
            return;
        }

        updateMyPresence({ cursor: current });
    }, [camera, canvasState, startMultiSelection, translateSelectedLayer, updateSelectionNet, updateLassoSelection, resizeSelectedLayer, eraseIntersecting, continueDrawing, updateMyPresence]);

    const onPointerLeave = useCallback(() => {
        updateMyPresence({ cursor: null });
    }, [updateMyPresence]);


    const onPointerDown = useCallback((e: React.PointerEvent) => {
        const point = pointerEventToCanvasPoint(e, camera);

        if (e.button === 2 || e.button === 1) {
            setCanvasState({ 
                mode: CanvasMode.TranslatingCamera, 
                origin: point, 
                current: point,
                previousMode: canvasState.mode,
                ...(canvasState.mode === CanvasMode.Inserting ? { previousLayerType: canvasState.layerType } : {})
            });
            return;
        }

        if (canvasState.mode === CanvasMode.Inserting) {
            return;
        }

        if (canvasState.mode === CanvasMode.Pencil) {
            startDrawing(point, e.pressure);
            return;
        }

        if (canvasState.mode === CanvasMode.Eraser) {
            eraseIntersecting(point);
            return;
        }

        if (canvasState.mode === CanvasMode.LassoSelection) {
            setCanvasState({ mode: CanvasMode.LassoSelection, points: [point] });
            return;
        }

        setCanvasState({ origin: point, mode: CanvasMode.Pressing });
    }, [camera, canvasState.mode, setCanvasState, startDrawing, eraseIntersecting]);

    // when pointer is up, call insertLayer() function
    const onPointerUp = useCallback((
        e: React.PointerEvent
    ) => {
        const point = pointerEventToCanvasPoint(e, camera);
        if (canvasState.mode === CanvasMode.Pressing || canvasState.mode === CanvasMode.None) {
            unselectLayers();
            setCanvasState({
                mode: CanvasMode.None,
            });
        } else if (canvasState.mode === CanvasMode.SelectionNet) {
            applySelectionNet(canvasState.current || point, canvasState.origin);
            setCanvasState({
                mode: CanvasMode.None,
            });
        } else if (canvasState.mode === CanvasMode.LassoSelection) {
            applyLassoSelection(canvasState.points);
            setCanvasState({
                mode: CanvasMode.LassoSelection,
                points: [],
            });
        } else if (canvasState.mode ===  CanvasMode.Pencil) {
            insertPath();
        } else if (canvasState.mode === CanvasMode.Inserting) {
            insertLayer(canvasState.layerType, point, canvasState.cornerRadius);
        } else if (canvasState.mode === CanvasMode.TranslatingCamera) {
            if (canvasState.previousMode === CanvasMode.Inserting && canvasState.previousLayerType) {
                setCanvasState({ mode: CanvasMode.Inserting, layerType: canvasState.previousLayerType });
            } else if (canvasState.previousMode === CanvasMode.Pencil) {
                setCanvasState({ mode: CanvasMode.Pencil });
            } else if (canvasState.previousMode === CanvasMode.Eraser) {
                setCanvasState({ mode: CanvasMode.Eraser });
            } else {
                setCanvasState({ mode: CanvasMode.None });
            }
        } else {
            setCanvasState({
                mode: CanvasMode.None,
            });
        }

        history.resume();
    }, [
        camera,
        canvasState,
        setCanvasState,
        history,
        insertLayer,
        insertPath,
        unselectLayers,
        applySelectionNet,
        applyLassoSelection,
    ]);

    // A function to allow selecting any layer/shape
    const onLayerPointerDown = useMutation((
        { self, setMyPresence },
        e: React.PointerEvent,
        layerId: string,
    ) => {
        const currentMode = canvasStateRef.current.mode;
        if (
            currentMode === CanvasMode.Pencil ||
            currentMode === CanvasMode.Inserting ||
            e.button === 2 ||
            e.button === 1
        ) {
            return;
        }

        history.pause();
        e.stopPropagation();

        const point = pointerEventToCanvasPoint(e, cameraRef.current);

        if (!self.presence.selection.includes(layerId)) {
            setMyPresence({ selection: [layerId]}, {addToHistory: true});
        }
        setCanvasState({ mode: CanvasMode.Translating, current: point});
    }, [
        setCanvasState, 
        history, 
    ]);

    const onSelectionPointerDown = useCallback((e: React.PointerEvent) => {
        const currentMode = canvasStateRef.current.mode;
        if (
            currentMode === CanvasMode.Pencil ||
            currentMode === CanvasMode.Inserting ||
            e.button === 2 ||
            e.button === 1
        ) {
            return;
        }

        history.pause();
        e.stopPropagation();

        const point = pointerEventToCanvasPoint(e, cameraRef.current);
        setCanvasState({ mode: CanvasMode.Translating, current: point });
    }, [history, setCanvasState]);

    const selections = useOthersMapped((otherUser) => otherUser.presence.selection);

    const layerIdsToColorSelection = useMemo(() => {
        const layerIdsToColorSelection: Record<string, string> = {};

        for (const user of selections) {
            const [connectinoId, selection] = user;

            for (const layerId of selection) {
                layerIdsToColorSelection[layerId] = connectionIdToColor(connectinoId);
            }
        } 

        return layerIdsToColorSelection;
    }, [selections]);


    const deleteLayers = useDeleteLayers();

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            switch (e.key) {
                // case "Backspace":    // BUG: while typing, if clicked Backspace, it deletes the layer
                //     deleteLayers();
                //     break;
                
                case "Delete":
                    deleteLayers();
                    break;

                case "z": {
                    if (e.ctrlKey || e.metaKey) {
                        if (e.shiftKey) {
                            history.redo();
                        } else{
                            history.undo();
                        }
                    }
                    break;
                }

                case "y": {
                    if (e.ctrlKey || e.metaKey) {
                        history.redo();
                    }
                    break;
                }
            }
        }
        document.addEventListener("keydown", onKeyDown);
        
        // Always unmount eventlistener to prevent overflows
        return () => {
            document.removeEventListener("keydown", onKeyDown);
        }
    }, [deleteLayers, history]);

    const gridSize = 30 * (camera.scale || 1);
    const gridOffsetX = camera.x % gridSize;
    const gridOffsetY = camera.y % gridSize;

    return (
        <main className="h-full w-full relative bg-neutral-100 touch-none">
            <Info boardId={boardId}/>
            <Participants/>
            <Toolbar
                canvasState={canvasState}
                setCanvasState={setCanvasState}
                canUndo={canUndo}
                canRedo={canRedo}
                undo={history.undo}
                redo={history.redo}
                lastUsedPenSize={lastUsedPenSize}
                setLastUsedPenSize={setLastUsedPenSize}
                setLastUsedColor={onChangeColor}
            />

            <SelectionTools
                camera={camera}
                setLastUsedColor={onChangeColor}
            />

            {/* svg is scalable vector graphics coontainer. shapes never blur on zoom.. as vector based, not pixel images*/}
            <svg
                className="h-[100vh] w-[100vw]"
                onWheel={onWheel}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                onPointerUp={onPointerUp}
                onPointerDown={onPointerDown}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                    cursor: canvasState.mode === CanvasMode.Pencil 
                        ? `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>') 0 24, crosshair`
                        : canvasState.mode === CanvasMode.Eraser
                            ? `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"></path><path d="M22 21H7"></path><path d="m5 11 9 9"></path></svg>') 0 24, cell`
                            : undefined
                }}
            >
                <defs>
                    <pattern
                        id="grid-pattern"
                        width={gridSize}
                        height={gridSize}
                        patternUnits="userSpaceOnUse"
                        x={gridOffsetX}
                        y={gridOffsetY}
                    >
                        <path d={`M ${gridSize} 0 L 0 0 L 0 ${gridSize}`} fill="none" stroke="#e5e7eb" strokeWidth="1" />
                    </pattern>
                </defs>
                
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />

                <g
                    style={{
                        transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale || 1})`
                    }}
                >
                    {layerIds?.map((layerId) => (
                        <LayerPreview
                            key={layerId}
                            id={layerId}
                            onLayerPointerDown = {onLayerPointerDown}
                            selectionColor = {layerIdsToColorSelection[layerId]}
                        />
                    ))}

                    <SelectionBox
                        onResizeHandlePointerDown={onResizeHandlePointerDown}
                        onSelectionPointerDown={onSelectionPointerDown}
                    />

                    {canvasState.mode === CanvasMode.SelectionNet && canvasState.current != null && (
                        <rect
                            className="fill-blue-500/5 stroke-blue-500 stroke-1"
                            x={Math.min(canvasState.origin.x, canvasState.current.x)}
                            y={Math.min(canvasState.origin.y, canvasState.current.y)}
                            width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                            height={Math.abs(canvasState.origin.y - canvasState.current.y)}
                        />
                    )}

                    {canvasState.mode === CanvasMode.LassoSelection && canvasState.points.length > 0 && (
                        <polygon
                            points={canvasState.points.map(p => `${p.x},${p.y}`).join(" ")}
                            className="fill-blue-500/5 stroke-blue-500 stroke-1"
                            strokeDasharray="4 2"
                        />
                    )}

                    <CursorPresense/>

                    <DraftLayer lastUsedColor={lastUsedColor} penSize={lastUsedPenSize} />
                </g>
            </svg>
        </main>      
    );
};
