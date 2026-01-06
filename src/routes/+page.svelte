<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&display=swap"
        rel="stylesheet"
    />
</svelte:head>

<script>
    import { onMount } from "svelte";
    import Icon from "@iconify/svelte";
    import Canvas from "$lib/Canvas.svelte";

    let theme = "dark";

    const applyTheme = (next) => {
        theme = next;
        const root = document.documentElement;
        root.dataset.theme = next;
        localStorage.setItem("copycanvas-theme", next);
    };

    const toggleTheme = () => applyTheme(theme === "dark" ? "light" : "dark");

    onMount(() => {
        const saved = localStorage.getItem("copycanvas-theme");
        if (saved === "light" || saved === "dark") {
            applyTheme(saved);
            return;
        }
        const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        applyTheme(prefersLight ? "light" : "dark");
    });
</script>

<main class="page">
    <section class="workbench">
        <div class="topbar">
            <div class="brand">copycanvas</div>
            <button class="mode" on:click={toggleTheme} aria-label="테마 전환">
                <Icon icon={theme === "dark" ? "lucide:sun" : "lucide:moon"} width="18" height="18" />
            </button>
        </div>
        <Canvas />
    </section>
</main>

<style>
    :global(html),
    :global(body) {
        margin: 0;
        background: var(--page-bg);
        color: var(--text);
        font-family: "Manrope", system-ui, -apple-system, sans-serif;
    }

    :global(body) {
        min-height: 100vh;
    }

    main.page {
        display: flex;
        justify-content: center;
        padding: 24px;
    }

    .workbench {
        background: var(--panel-strong);
        border-radius: 18px;
        padding: 18px;
        width: 100%;
        max-width: 1400px;
    }

    .topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

    .brand {
        font-weight: 800;
        letter-spacing: 0.02em;
        font-size: 18px;
        color: var(--text);
    }

    .mode {
        margin-top: 12px;
        background: var(--surface);
        color: var(--text);
        border: 1px solid var(--border);
        padding: 8px 10px;
        border-radius: 10px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    @media (max-width: 960px) {
        main.page {
            padding: 16px;
        }
    }

    :global(:root[data-theme="dark"]) {
        --page-bg: #0a0a0b;
        --panel: linear-gradient(180deg, #0d0d0f, #0a0a0b);
        --panel-strong: #0c0c0d;
        --border: #1b1b1d;
        --text: #f5f5f5;
        --muted: #9b9b9b;
        --muted-strong: #c5c5c5;
        --surface: #161617;
        --surface-weak: #1f1f20;
        --accent: #e8e8e8;
        --accent-foreground: #0a0a0b;
    }

    :global(:root[data-theme="light"]) {
        --page-bg: #f7f7f8;
        --panel: #ffffff;
        --panel-strong: #ffffff;
        --border: #e2e2e4;
        --text: #0c0c0d;
        --muted: #5c5c5f;
        --muted-strong: #3a3a3d;
        --surface: #f0f0f2;
        --surface-weak: #e5e5e7;
        --accent: #0c0c0d;
        --accent-foreground: #ffffff;
    }
</style>