<script lang="ts">
    import { onMount } from "svelte";
    import Tool from "./Tool.svelte";

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null = null;

    let width = 720;
    let height = 540;
    let color = "#111";
    let background = "#f5f5f5";
    let transparentBg = false;
    let lineWidth = 3;
    let showGrid = true;
    let gridSize = 16;
    let autoCopy = true;

    let exportFormat: "image/png" | "image/jpeg" | "image/webp" = "image/png";
    let exportScale = 1;
    let filename = "copycanvas";

    let isDrawing = false;
    let start = { x: 0, y: 0 };

    let undoStack: ImageData[] = [];
    let redoStack: ImageData[] = [];

    let pages = [{ id: crypto.randomUUID(), name: "Page 1", dataUrl: "" }];
    let activePageId = pages[0].id;

    let bounds = { top: 0, left: 0 };
    let lastSize = { w: width, h: height };
    let previousBackground = background;
    let previousTransparent = transparentBg;

    const hexToRgb = (hex: string) => {
        const normalized = hex.replace("#", "");
        const full = normalized.length === 3
            ? normalized.split("").map((c) => c + c).join("")
            : normalized;
        const int = parseInt(full, 16);
        return {
            r: (int >> 16) & 255,
            g: (int >> 8) & 255,
            b: int & 255
        };
    };

    const stripBackground = (hex: string) => {
        if (!ctx || !canvas || !hex) return;
        const target = hexToRgb(hex);
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = image.data;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] === target.r && data[i + 1] === target.g && data[i + 2] === target.b) {
                data[i + 3] = 0;
            }
        }
        ctx.putImageData(image, 0, 0);
    };

    const applyBackgroundChange = () => {
        if (!ctx || !canvas) return;
        if (transparentBg) {
            stripBackground(previousBackground);
        } else {
            stripBackground(previousBackground);
            ctx.save();
            ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
        previousBackground = background;
        previousTransparent = transparentBg;
    };

    const withCtx = (fn: (c: CanvasRenderingContext2D) => void) => {
        if (ctx) fn(ctx);
    };

    const configureContext = () => {
        withCtx((c) => {
            c.strokeStyle = color;
            c.lineWidth = Number(lineWidth) || 1;
            c.lineCap = "round";
            c.lineJoin = "round";
        });
    };

    const fillBackground = () => {
        withCtx((c) => {
            if (transparentBg) {
                c.clearRect(0, 0, canvas.width, canvas.height);
            } else {
                c.fillStyle = background;
                c.fillRect(0, 0, canvas.width, canvas.height);
            }
            previousBackground = background;
            previousTransparent = transparentBg;
        });
    };

    const snapshot = () => ctx?.getImageData(0, 0, canvas.width, canvas.height);

    const pushUndo = () => {
        const snap = snapshot();
        if (!snap) return;
        undoStack = [...undoStack.slice(-49), snap];
    };

    const captureClipboard = async () => {
        if (!autoCopy || !canvas.toBlob) return;
        return new Promise<void>((resolve) => {
            canvas.toBlob(async (blob) => {
                if (!blob) return resolve();
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ [blob.type]: blob })
                    ]);
                } catch (err) {
                    console.error("Clipboard write failed", err);
                }
                resolve();
            }, exportFormat);
        });
    };

    const redrawFromImage = (img: HTMLImageElement) => {
        withCtx((c) => {
            fillBackground();
            c.drawImage(img, 0, 0, canvas.width, canvas.height);
        });
    };

    const loadFromDataUrl = (dataUrl: string) => {
        if (!dataUrl) {
            fillBackground();
            return;
        }
        const img = new Image();
        img.onload = () => redrawFromImage(img);
        img.src = dataUrl;
    };

    const persistPage = () => {
        const idx = pages.findIndex((p) => p.id === activePageId);
        if (idx === -1 || !canvas) return;
        pages[idx] = { ...pages[idx], dataUrl: canvas.toDataURL("image/png") };
    };

    const selectPage = (id: string) => {
        persistPage();
        activePageId = id;
        const page = pages.find((p) => p.id === id);
        if (page) {
            loadFromDataUrl(page.dataUrl);
            resetHistory();
        }
    };

    const addPage = () => {
        persistPage();
        const id = crypto.randomUUID();
        pages = [...pages, { id, name: `Page ${pages.length + 1}`, dataUrl: "" }];
        selectPage(id);
    };

    const duplicatePage = () => {
        persistPage();
        const current = pages.find((p) => p.id === activePageId);
        const id = crypto.randomUUID();
        pages = [
            ...pages,
            { id, name: `${current?.name || "Page"} Copy`, dataUrl: current?.dataUrl || canvas?.toDataURL("image/png") || "" }
        ];
        selectPage(id);
    };

    const deletePage = () => {
        if (pages.length === 1) return;
        const nextPages = pages.filter((p) => p.id !== activePageId);
        pages = nextPages;
        const fallback = nextPages[0];
        selectPage(fallback.id);
    };

    const resetHistory = () => {
        undoStack = [];
        redoStack = [];
    };

    const resetCanvas = (silent = false) => {
        if (!silent && !confirm("Reset canvas?")) return;
        pushUndo();
        fillBackground();
        redoStack = [];
        captureClipboard();
    };

    const resizeCanvas = (w: number, h: number) => {
        if (!canvas) return;
        const prev = canvas.toDataURL("image/png");
        canvas.width = w;
        canvas.height = h;
        configureContext();
        fillBackground();
        if (prev) loadFromDataUrl(prev);
        resetHistory();
    };

    const updateBounds = () => {
        const rect = canvas.getBoundingClientRect();
        bounds = { top: rect.top, left: rect.left };
    };

    onMount(() => {
        ctx = canvas.getContext("2d");
        configureContext();
        fillBackground();
        updateBounds();

        const saved = localStorage.getItem("copycanvas:last");
        if (saved) loadFromDataUrl(saved);
    });

    $: if (canvas && (width !== lastSize.w || height !== lastSize.h)) {
        resizeCanvas(Number(width), Number(height));
        lastSize = { w: Number(width), h: Number(height) };
    }

    $: configureContext();

    $: if (ctx && canvas && (background !== previousBackground || transparentBg !== previousTransparent)) {
        applyBackgroundChange();
    }

    const handleStart = ({ offsetX: x, offsetY: y }) => {
        isDrawing = true;
        start = { x, y };
        pushUndo();
        redoStack = [];
    };

    const handleDraw = (x: number, y: number) => {
        withCtx((c) => {
            c.beginPath();
            c.moveTo(start.x, start.y);
            c.lineTo(x, y);
            c.stroke();
        });
        start = { x, y };
    };

    const handleMove = (e: MouseEvent) => {
        if (!isDrawing || e.buttons !== 1) return;
        handleDraw(e.offsetX, e.offsetY);
    };

    const handleMoveTouch = (e: TouchEvent) => {
        if (!isDrawing) return;
        const { clientX, clientY } = e.touches[0];
        handleDraw(clientX - bounds.left, clientY - bounds.top);
    };

    const handleEnd = () => {
        if (!isDrawing) return;
        isDrawing = false;
        captureClipboard();
        localStorage.setItem("copycanvas:last", canvas.toDataURL("image/png"));
        persistPage();
    };

    const undo = () => {
        if (!undoStack.length) return;
        const prev = undoStack.pop();
        const snap = snapshot();
        if (snap) redoStack = [...redoStack, snap].slice(-50);
        if (prev) withCtx((c) => c.putImageData(prev, 0, 0));
        captureClipboard();
    };

    const redo = () => {
        const next = redoStack.pop();
        if (!next) return;
        pushUndo();
        withCtx((c) => c.putImageData(next, 0, 0));
        captureClipboard();
    };

    const download = () => exportImage({ format: "image/png" });

    const exportImage = ({
        format = exportFormat,
        name = filename,
        scale = exportScale,
        quality = 0.92
    }: {
        format?: "image/png" | "image/jpeg" | "image/webp";
        name?: string;
        scale?: number;
        quality?: number;
    }) => {
        if (!canvas) return;
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = Math.round(canvas.width * Math.max(scale, 1));
        exportCanvas.height = Math.round(canvas.height * Math.max(scale, 1));
        const exportCtx = exportCanvas.getContext("2d");
        if (!exportCtx) return;

        if (!transparentBg) {
            exportCtx.fillStyle = background;
            exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        }

        exportCtx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
        const url = exportCanvas.toDataURL(format, quality);
        const link = document.createElement("a");
        link.download = `${name || "canvas"}.${format.replace("image/", "")}`;
        link.href = url;
        link.click();
    };

    const saveLocal = () => {
        localStorage.setItem("copycanvas:last", canvas.toDataURL("image/png"));
    };

    const loadLocal = () => {
        const saved = localStorage.getItem("copycanvas:last");
        if (saved) loadFromDataUrl(saved);
    };

    const keyboardHandler = (e: KeyboardEvent) => {
        if (!e.ctrlKey) return;
        switch (e.key.toLowerCase()) {
            case "z":
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
                break;
            case "y":
                e.preventDefault();
                redo();
                break;
            case "s":
                e.preventDefault();
                download();
                break;
        }
    };
</script>

<svelte:window on:resize={updateBounds} />

<div class="canvas-shell">
    <div class="canvas-area" style={`--grid-size:${gridSize}px`}>
        <Tool
            bind:height
            bind:width
            bind:color
            bind:background
            bind:transparentBg
            bind:lineWidth
            bind:showGrid
            bind:gridSize
            bind:autoCopy
            bind:filename
            bind:exportFormat
            bind:exportScale
            pages={pages}
            activePageId={activePageId}
            onReset={resetCanvas}
            onUndo={undo}
            onRedo={redo}
            onDownload={download}
            onExport={exportImage}
            onSaveLocal={saveLocal}
            onLoadLocal={loadLocal}
            onNewPage={addPage}
            onDuplicatePage={duplicatePage}
            onDeletePage={deletePage}
            onSelectPage={selectPage}
        />

        <div class={`board ${showGrid ? "board-grid" : ""}`}>
            {#if transparentBg}
                <div class="checker" aria-hidden="true"></div>
            {/if}
            <canvas
                tabindex="0"
                bind:this={canvas}
                width={width}
                height={height}
                on:keydown={keyboardHandler}
                on:mousedown={handleStart}
                on:touchstart={(e) => {
                    const { clientX, clientY } = e.touches[0];
                    handleStart({ offsetX: clientX - bounds.left, offsetY: clientY - bounds.top });
                }}
                on:mouseup={handleEnd}
                on:touchend={handleEnd}
                on:mouseleave={handleEnd}
                on:mousemove={handleMove}
                on:touchmove={handleMoveTouch}
            ></canvas>
        </div>
    </div>
</div>

<style>
    .canvas-shell {
        width: 100%;
    }

    .canvas-area {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
    }

    .board {
        position: relative;
        border-radius: 14px;
        padding: 14px;
        background: var(--panel-strong);
    }

    .board-grid::after {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 14px;
        background-image: linear-gradient(to right, color-mix(in srgb, var(--text) 12%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in srgb, var(--text) 12%, transparent) 1px, transparent 1px);
        background-size: var(--grid-size) var(--grid-size);
        border-radius: 10px;
    }

    .checker {
        position: absolute;
        inset: 14px;
        background-image: linear-gradient(45deg, #d9d9d9 25%, transparent 25%),
            linear-gradient(-45deg, #d9d9d9 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #d9d9d9 75%),
            linear-gradient(-45deg, transparent 75%, #d9d9d9 75%);
        background-size: 24px 24px;
        background-position: 0 0, 0 12px, 12px -12px, -12px 0px;
        border-radius: 10px;
        z-index: 0;
    }

    canvas {
        position: relative;
        z-index: 1;
        background: transparent;
        display: block;
        border-radius: 10px;
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--text) 8%, transparent);
    }

    @media (max-width: 960px) {
        .canvas-area {
            flex-direction: column;
        }
        .board {
            width: 100%;
        }
    }
</style>