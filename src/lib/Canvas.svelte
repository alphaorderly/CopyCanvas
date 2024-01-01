<script>
    import { afterUpdate, onMount } from "svelte";
    import Tool from "./Tool.svelte";


    let canvas;

    let context;

    let isDrawing = false;

    let start;
    let width = 300;
    let height = 300;
    let undoArray = []
    let undoIndex = -1;

    let reserve = false;
    let reservedImage;

    let color = 'black';
    let background = 'white';
    let lineWidth = 1.0;

    $: color && changeColor();

    const changeColor = () => {
        if(context !== undefined && context !== null) {
            reserve = true;
            reservedImage = context.getImageData(0, 0, canvas.width, canvas.height);
            context.strokeStyle = color;
        }
    }

    const changeLineWidth = () => {
        if(context !== undefined && context !== null) {
            reserve = true;
            reservedImage = context.getImageData(0, 0, canvas.width, canvas.height);
            context.lineWidth = lineWidth
        }
    }

    $: lineWidth && changeLineWidth();

    let t, l;

    const setBackground = (color) => {
        context.fillStyle = color;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    onMount(() => {
        context = canvas.getContext('2d');
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        setBackground(background);
        handleSize();
    })

    afterUpdate(() => {
        setBackground('white');
        if(!reserve) {
            resetUndo();
        } else {
            context.putImageData(reservedImage, 0, 0);
            reserve = false;
        }
    })

    const handleSize = () => {
		const { top, left } = canvas.getBoundingClientRect()
		t = top
		l = left
        reserve = true;
        reservedImage = context.getImageData(0, 0, canvas.width, canvas.height);
	}

    const handleStart = ({ offsetX: x, offsetY: y }) => { 
		isDrawing = true
		start = { x, y }
	}

	const handleMove = ({ offsetX: x1, offsetY: y1, buttons: b }) => {
        if(b == 1) {

            if(!isDrawing) {
                start = { x1, y1 }
                isDrawing = true;
            }

            const { x, y } = start

            context.beginPath()
            context.moveTo(x, y);
            context.lineTo(x1, y1);
            context.closePath()
            context.stroke();

            console.log(x, y, x1, y1)

            start = { x: x1, y: y1 }
        }
	}

    const handleEnd = () => {
        if(isDrawing) {
            isDrawing = false
            canvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({'image/png': blob})]))

            undoArray.push(context.getImageData(0, 0, canvas.width, canvas.height))
            undoIndex += 1
        }
    }

    const resetCanvas = () => {
        if(confirm(`reset canvas?`)) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            setBackground('white');
            resetUndo();
        }
    }

    const resetUndo = () => {
        undoArray.length = 0;
        undoIndex = -1;
    }

    const download = () => {
        var link = document.createElement('a');
        link.download = 'download.png';
        link.href = canvas.toDataURL()
        link.click();
    }

    const undo = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        setBackground('white');
        if(undoIndex >= 0) {
            undoArray.pop();
            undoIndex -= 1;
            if(undoIndex >= 0) {
                context.putImageData(undoArray[undoIndex], 0, 0)
            }
        }
    }

    const keyboardHandler = (e) => {  
        if(e.ctrlKey) {
            switch(e.key) {
                case 'z':
                    e.preventDefault();
                    undo();
                    return
                case 's':
                    e.preventDefault();
                    download();
                    return
            }
        } 
    }

</script>

<style>
    #canvas_container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: auto;
    }
    canvas {
        display: block;
        border: 0.5px black solid;
    }
</style>

<svelte:window on:resize={handleSize} />

<div 
    style="width:{width}px;margin-top:100px;" 
    id="canvas_container"
>

    <Tool 
        bind:height
        bind:width
        bind:color
        bind:lineWidth
        reset={resetCanvas}
    />

    <canvas
        tabindex='1'    
        width={width}
        height={height}
        bind:this={canvas}
        on:keydown={keyboardHandler}

        on:mousedown={handleStart}	
        on:touchstart={e => {
            const { clientX, clientY } = e.touches[0]
            handleStart({
                offsetX: clientX - l,
                offsetY: clientY - t
            })
        }}	

        on:mouseup={handleEnd}				
        on:touchend={handleEnd}				
        on:mouseleave={handleEnd}

        on:mousemove={handleMove}
        on:touchmove={e => {
            const { clientX, clientY } = e.touches[0]
            handleMove({
                offsetX: clientX - l,
                offsetY: clientY - t
            })
        }}

    />
</div>