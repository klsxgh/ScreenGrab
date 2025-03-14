chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "display_screenshot") {
        let overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.background = "rgba(0, 0, 0, 0.5)";
        overlay.style.display = "flex";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.zIndex = "10000";

        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");

        let img = new Image();
        img.src = message.image;
        img.onload = () => {
            canvas.width = img.width / 2;
            canvas.height = img.height / 2;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };

        let drawing = false;
        canvas.addEventListener("mousedown", () => (drawing = true));
        canvas.addEventListener("mouseup", () => (drawing = false));
        canvas.addEventListener("mousemove", (event) => {
            if (!drawing) return;
            let rect = canvas.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        let saveBtn = document.createElement("button");
        saveBtn.innerText = "Save";
        saveBtn.style.position = "absolute";
        saveBtn.style.top = "10px";
        saveBtn.style.right = "10px";
        saveBtn.style.background = "green";
        saveBtn.style.color = "white";
        saveBtn.style.padding = "8px 12px";
        saveBtn.style.border = "none";
        saveBtn.style.cursor = "pointer";
        saveBtn.addEventListener("click", () => {
            let link = document.createElement("a");
            link.download = "screenshot.png";
            link.href = canvas.toDataURL();
            link.click();
        });

        overlay.appendChild(canvas);
        overlay.appendChild(saveBtn);
        document.body.appendChild(overlay);

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) overlay.remove();
        });
    }
});
