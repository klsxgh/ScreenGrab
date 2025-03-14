chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "capture_screenshot") {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, (imageUri) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }

            chrome.storage.local.set({ screenshot: imageUri }, () => {
                chrome.tabs.create({ url: "editor.html" });
            });
        });
    }
});
