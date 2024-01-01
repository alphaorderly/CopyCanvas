
<script>
    import ColorPicker from 'svelte-awesome-color-picker';

    import Icon from '@iconify/svelte';

    const rainbowBackground = `background-image: linear-gradient( 89.7deg, rgba(223,0,0,1) 2.7%, rgba(214,91,0,1) 15.1%, rgba(233,245,0,1) 29.5%, rgba(23,255,17,1) 45.8%, rgba(29,255,255,1) 61.5%, rgba(5,17,255,1) 76.4%, rgba(202,0,253,1) 92.4% );`

    export let height = 300;
    export let width = 300;
    export let reset;
    export let color;
    export let lineWidth;

    let colors = ["black", "red", "orange", "blue", "green"]

    let lines = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]

    const changeColor = (c) => {
        color = c
        console.log(c)
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
        outline: none;
    }

    .not_chosen_color {
        width: 20px;
        height: 20px;
        border-radius: 10px;
        outline: none;
    }

    input[type=color] {
        visibility: hidden;
    }
    
    .picker_chosen_color {
        background-clip: content-box;
        width: 16px;
        height: 16px;
        padding: 2px;
        border: 2px solid black;
        border-radius: 50%;
    }

    .picker_not_chosen_color {
        height: 20px;
        width: 20px;
        border-radius: 50%;
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
        {#each colors as circle_color}
            <span on:click={() => {changeColor(circle_color)}} style="background-color: {circle_color};" class:chosen_color={circle_color === color} class:not_chosen_color={circle_color !== color}></span>
        {/each}
        <label style={!color.startsWith("#") ? rainbowBackground : `background-color:${color}`} class:picker_not_chosen_color={!color.startsWith("#")} class:picker_chosen_color={color.startsWith("#")}><input type="color" on:input={(e) => changeColor(e.target.value)}/></label>
    </div>
    <div class="tool_row">
        <span on:click={() => {changeColor("white")}} class="icon_wrapper"><Icon style="color:{color == 'white' ? 'black' : 'gray'};" icon="mdi:eraser" width="20" height="20" /></span>
        <select bind:value={lineWidth}>
            {#each lines as line}
                <option value={line}>{line}px</option>
            {/each}
        </select>
    </div>
</div>
