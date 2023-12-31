
<script>
    import Icon from '@iconify/svelte';

    export let height = 300;
    export let width = 300;
    export let reset;
    export let color;

    let colors = ["black", "red", "orange", "blue", "green"]

    const changeColor = (index) => {
        color = colors[index]
        console.log(color)
    }
</script>

<style>
    #tool_container {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: start;
    }

    .canvas_size_input {
        text-align: center;
        width: 60px;
        height: 20px;
        border-radius: 5px;
        border: 0.8px rgba(0, 0, 0, 0.8) solid;
    }

    .tool_row {
        display: flex;
        flex-direction: row;
        align-items:center;
        margin-bottom: 10px;
    }

    .tool_row span {
        margin-right: 10px;
    }

    .chosen_color {
        background-clip: content-box;
        width: 16px;
        height: 16px;
        padding: 2px;
        border: 2px solid black;
        border-radius: 20px;
    }

    .not_chosen_color {
        width: 20px;
        height: 20px;
        border-radius: 10px;
    }

</style>


<div id="tool_container">
    <div class="tool_row">
        <input bind:value={width} type="text" class="canvas_size_input"/>
        <Icon icon="bx:x" width="20" height="20" />
        <input bind:value={height} type="text" class="canvas_size_input"/>
    </div>
    <div class="tool_row">
        <span on:click={reset} class="icon_wrapper"><Icon icon="fluent:arrow-reset-20-filled" width="25" height="25" style="cursor:pointer"/></span>
        {#each colors as circle_color, index}
            <span on:click={() => {changeColor(index)}} style="background-color: {circle_color};" class:chosen_color={circle_color === color} class:not_chosen_color={circle_color !== color}></span>
        {/each}
    </div>
</div>
