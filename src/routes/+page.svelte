<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Rubik+Doodle+Shadow&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" rel="stylesheet">
    
</svelte:head>

<script>
    import Canvas from "$lib/Canvas.svelte";

</script>

<style>


    main {
        display: flex;
    }

    header {
        background-color: #fefae0AA;
        height: 100vh;
        padding-left: 1vw;
        padding-right: 1vw;
    } 

    @media (max-width: 575px) {
        main {
            display: flex;
            flex-direction: column;
        }

        header {
            background-color: #fefae0AA;
            height: 100%;
            border-radius: 20px;
            padding-left: 20px;
            padding-right: 1vw;
        } 
    }

    header h1 {
       font-family: "Rubik Doodle Shadow"
    }
    header p {
       font-size: 14px;
    }
    :global(html), :global(body) {
        overflow:hidden;
        font-family:"Open Sans"
    }   
</style>

<main>
<header>
    <h1>COPYCANVAS</h1>
    <p>Draw what you want, <br/> Will automatically be copied on clipboard</p>
    <p>Ctrl + z : Undo</p>
    <p>Ctrl + s : Save</p>
</header>

<Canvas/>
</main>