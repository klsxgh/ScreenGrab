const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("color-picker");
const brushSizeSlider = document.getElementById("brush-size");
const brushSizeDisplay = document.getElementById("brush-size-display");
const blurBtn = document.getElementById("blur-btn");
const clearBtn = document.getElementById("clear-btn");
const saveBtn = document.getElementById("save-btn");

let drawing = false;
let isBlurring = false;
let lastX = 0;
let lastY = 0;
let brushSize = 5;
let blurSize = 20;
let screenshot = null;

let strokes = [];
let currentStroke = [];

brushSizeSlider.addEventListener("input", () => {
    brushSize = parseInt(brushSizeSlider.value);
    blurSize = brushSize * 2;
    brushSizeDisplay.textContent = brushSize + "px";
});

chrome.storage.local.get("screenshot", (data) => {
    if (data.screenshot) {
        screenshot = new Image();
        screenshot.src = data.screenshot;
        screenshot.onload = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.drawImage(screenshot, 0, 0, canvas.width, canvas.height);
        };
    }
});

canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    currentStroke = [];
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;

    if (isBlurring) {
        blurArea(e.offsetX, e.offsetY);
    } else {
        drawLine(lastX, lastY, e.offsetX, e.offsetY);
    }

    currentStroke.push({ x1: lastX, y1: lastY, x2: e.offsetX, y2: e.offsetY, color: colorPicker.value, size: brushSize, isBlur: isBlurring });

    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener("mouseup", () => {
    if (currentStroke.length > 0) {
        strokes.push([...currentStroke]); // Save the entire stroke
    }
    drawing = false;
});

canvas.addEventListener("mouseout", () => (drawing = false));

function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSize;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function blurArea(x, y) {
    let imageData = ctx.getImageData(x - blurSize / 2, y - blurSize / 2, blurSize, blurSize);
    let pixels = imageData.data;

    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < pixels.length; i += 4) {
        r += pixels[i];
        g += pixels[i + 1];
        b += pixels[i + 2];
        count++;
    }

    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);

    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
    }

    ctx.putImageData(imageData, x - blurSize / 2, y - blurSize / 2);
}

clearBtn.addEventListener("click", () => {
    strokes = [];
    redrawCanvas(); 
});

document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "z") {
        if (strokes.length > 0) {
            strokes.pop();
            redrawCanvas();
        }
    }
});


function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (screenshot) {
        ctx.drawImage(screenshot, 0, 0, canvas.width, canvas.height);
    }

    strokes.forEach(stroke => {
        stroke.forEach(line => {
            if (line.isBlur) {
                blurArea(line.x2, line.y2);
            } else {
                ctx.strokeStyle = line.color;
                ctx.lineWidth = line.size;
                ctx.lineJoin = "round";
                ctx.lineCap = "round";
                
                ctx.beginPath();
                ctx.moveTo(line.x1, line.y1);
                ctx.lineTo(line.x2, line.y2);
                ctx.stroke();
            }
        });
    });
}

saveBtn.addEventListener("click", () => {
    let link = document.createElement("a");
    link.download = "edited_screenshot.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});

blurBtn.addEventListener("click", () => {
    isBlurring = !isBlurring;
    blurBtn.classList.toggle("active", isBlurring);
});

colorPicker.addEventListener("input", () => {
    colorPicker.style.backgroundColor = colorPicker.value;
});

window.addEventListener("resize", () => {
    redrawCanvas();
});
