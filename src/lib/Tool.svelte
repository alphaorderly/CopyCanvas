<script lang="ts">
    import Icon from "@iconify/svelte";

    export let height = 540;
    export let width = 720;
    export let color = "#111";
    export let background = "#f5f5f5";
    export let transparentBg = false;
    export let lineWidth = 3;
    export let showGrid = true;
    export let gridSize = 16;
    export let autoCopy = true;
    export let filename = "copycanvas";
    export let exportFormat: "image/png" | "image/jpeg" | "image/webp" = "image/png";
    export let exportScale = 1;

    export let pages: { id: string; name: string; dataUrl: string }[] = [];
    export let activePageId: string;

    export let onReset: () => void;
    export let onUndo: () => void;
    export let onRedo: () => void;
    export let onDownload: () => void;
    export let onExport: (opts: { format?: "image/png" | "image/jpeg" | "image/webp"; name?: string; scale?: number }) => void;
    export let onSaveLocal: () => void;
    export let onLoadLocal: () => void;
    export let onNewPage: () => void;
    export let onDuplicatePage: () => void;
    export let onDeletePage: () => void;
    export let onSelectPage: (id: string) => void;

    const palette = ["#111", "#444", "#888", "#cfcfcf", "#ffffff"];
    const lineOptions = [1, 2, 3, 4, 6, 8, 10, 12];

    const handleSelectPage = (event: Event) => {
        const target = event.currentTarget as HTMLSelectElement | null;
        if (target) onSelectPage(target.value);
    };

    const handleLineWidth = (event: Event) => {
        const target = event.currentTarget as HTMLSelectElement | null;
        if (!target) return;
        const value = Number(target.value);
        if (!Number.isNaN(value)) lineWidth = value;
    };
</script>

<div class="panel">
    <div class="panel__header">
        <div>
            <p class="eyebrow">Workspace</p>
            <h3>Controls</h3>
        </div>
    </div>

    <div class="cluster">
        <div class="field">
            <p class="label-title">Canvas (px)</p>
            <div class="inputs">
                <input type="number" min="64" max="4096" bind:value={width} />
                <span class="by">×</span>
                <input type="number" min="64" max="4096" bind:value={height} />
            </div>
        </div>

        <div class="field">
            <p class="label-title">Pages</p>
            <div class="inputs">
                <select bind:value={activePageId} on:change={handleSelectPage} aria-label="페이지 선택">
                    {#each pages as page}
                        <option value={page.id}>{page.name}</option>
                    {/each}
                </select>
                <div class="buttons">
                    <button class="ghost" on:click={onNewPage} title="New page">
                        <Icon icon="lucide:plus" width="16" />
                    </button>
                    <button class="ghost" on:click={onDuplicatePage} title="Duplicate page">
                        <Icon icon="lucide:copy" width="16" />
                    </button>
                    <button class="ghost" on:click={onDeletePage} title="Delete page">
                        <Icon icon="lucide:trash" width="16" />
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="cluster two-cols">
        <div class="field">
            <p class="label-title">Stroke</p>
            <div class="palette">
                {#each palette as swatch}
                    <button
                        class={`swatch ${color === swatch ? "active" : ""}`}
                        style={`background:${swatch}`}
                        on:click={() => (color = swatch)}
                        aria-pressed={color === swatch}
                        aria-label={`색상 ${swatch}`}
                    ></button>
                {/each}
                <label class="picker" aria-label="직접 색상 선택">
                    <input type="color" bind:value={color} />
                </label>
            </div>
            <div class="inputs">
                <select bind:value={lineWidth} on:change={handleLineWidth} aria-label="선 두께">
                    {#each lineOptions as value}
                        <option value={value}>{value}px</option>
                    {/each}
                </select>
                <button class="ghost" on:click={() => (color = "#fff")} title="Eraser (white)">
                    <Icon icon="lucide:eraser" width="16" />
                </button>
            </div>
        </div>

        <div class="field">
            <p class="label-title">Background</p>
            <div class="inputs">
                <input type="color" bind:value={background} disabled={transparentBg} />
                <label class="toggle">
                    <input type="checkbox" bind:checked={transparentBg} />
                    <span>Transparent</span>
                </label>
            </div>
            <div class="inputs">
                <label class="toggle">
                    <input type="checkbox" bind:checked={showGrid} />
                    <span>Grid</span>
                </label>
                <input type="number" min="4" max="128" step="2" bind:value={gridSize} aria-label="격자 간격" />
            </div>
        </div>
    </div>

    <div class="cluster two-cols">
        <div class="field">
            <p class="label-title">History</p>
            <div class="buttons">
                <button on:click={onUndo}>
                    <Icon icon="lucide:undo" width="16" /> Undo
                </button>
                <button on:click={onRedo}>
                    <Icon icon="lucide:redo" width="16" /> Redo
                </button>
                <button class="ghost" on:click={onReset}>
                    <Icon icon="lucide:rotate-ccw" width="16" /> Reset
                </button>
            </div>
        </div>

        <div class="field">
            <p class="label-title">Clipboard</p>
            <label class="toggle">
                <input type="checkbox" bind:checked={autoCopy} />
                <span>Auto copy on draw</span>
            </label>
            <div class="buttons">
                <button class="ghost" on:click={onSaveLocal}>Save</button>
                <button class="ghost" on:click={onLoadLocal}>Load</button>
            </div>
        </div>
    </div>

    <div class="cluster">
        <div class="field">
            <p class="label-title">Export</p>
            <div class="inputs">
                <input type="text" bind:value={filename} placeholder="filename" aria-label="파일 이름" />
                <select bind:value={exportFormat} aria-label="포맷">
                    <option value="image/png">PNG</option>
                    <option value="image/jpeg">JPG</option>
                    <option value="image/webp">WEBP</option>
                </select>
                <input type="number" min="1" max="4" step="0.5" bind:value={exportScale} aria-label="배율" />
            </div>
            <div class="buttons">
                <button on:click={onDownload}>
                    <Icon icon="lucide:download" width="16" /> Quick save
                </button>
                <button
                    class="ghost"
                    on:click={() => onExport({ format: exportFormat, name: filename, scale: exportScale })}
                >
                    <Icon icon="lucide:export" width="16" /> Export options
                </button>
            </div>
        </div>
    </div>

    <div class="hint">
        <div class="hint__row">
            <span>Ctrl/Cmd + Z</span>
            <span>Undo · Shift+Z redo</span>
        </div>
        <div class="hint__row">
            <span>Ctrl/Cmd + S</span>
            <span>Quick save PNG</span>
        </div>
        <div class="hint__row">
            <span>Click + drag</span>
            <span>Draw · touch supported</span>
        </div>
    </div>
</div>

<style>
    .panel {
        background: var(--panel);
        color: var(--text);
        border-radius: 16px;
        padding: 16px;
        width: 360px;
    }

    .panel__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 10px;
        color: var(--muted);
        margin: 0;
    }

    h3 {
        margin: 2px 0 0;
        font-size: 18px;
        color: var(--text);
    }

    .cluster {
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 12px;
        margin-top: 10px;
        background: var(--panel);
    }

    .two-cols {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 10px;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    label {
        color: var(--muted-strong);
        font-size: 12px;
    }

    .label-title {
        color: var(--muted-strong);
        font-size: 12px;
        margin: 0;
    }

    .inputs {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    input,
    select {
        background: var(--surface);
        color: var(--text);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 8px 10px;
        font-size: 13px;
        width: 100%;
    }

    input[type="color"] {
        padding: 0;
        width: 36px;
        height: 36px;
        border-radius: 6px;
    }

    .by {
        color: var(--muted);
    }

    .buttons {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    button {
        background: var(--accent);
        color: var(--accent-foreground);
        border: none;
        padding: 8px 12px;
        border-radius: 10px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        font-size: 12px;
    }

    button.ghost {
        background: var(--surface);
        color: var(--text);
        border: 1px solid var(--border);
    }

    .palette {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .swatch {
        width: 30px;
        height: 30px;
        border-radius: 6px;
        border: 1px solid var(--border);
        cursor: pointer;
    }

    .swatch.active {
        outline: 2px solid var(--muted-strong);
    }

    .picker {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: 1px dashed var(--border);
        background: var(--surface-weak);
    }

    .picker input[type="color"] {
        width: 100%;
        height: 100%;
        border: none;
        padding: 0;
        background: transparent;
        cursor: pointer;
    }

    .toggle {
        display: inline-flex;
        gap: 8px;
        align-items: center;
        color: var(--muted-strong);
        font-size: 13px;
    }

    .toggle input {
        width: auto;
    }

    .hint {
        margin-top: 12px;
        border: 1px dashed var(--border);
        border-radius: 12px;
        padding: 10px 12px;
        background: var(--panel-strong);
        color: var(--muted);
        font-size: 12px;
    }

    .hint__row {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        padding: 3px 0;
    }

    @media (max-width: 960px) {
        .panel {
            width: 100%;
        }
    }
</style>
