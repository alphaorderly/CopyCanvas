<script>
    import Canvas from "$lib/Canvas.svelte";
</script>

<style>
    .header h1 {
        margin-left: 10vw;
    }
    .header p {
        margin-left: 10vw;
    }
</style>

<div class="header">
    <h1>COPYCANVAS</h1>
    <p>Draw what you want, Will automatically be copied on clipboard</p>
    <p>Ctrl + z : UNDO || Ctrl + s : Save</p>
</div>

<Canvas/>