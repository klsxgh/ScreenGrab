document.getElementById("capture-btn").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.startsWith("http")) {
        alert("Cannot capture this page!");
        return;
    }

    chrome.runtime.sendMessage({ action: "capture_screenshot" });
});
