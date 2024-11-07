chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "rephrase",
    title: "Rephrase with RephaserAI",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "rephrase") {
    const selectedText = info.selectionText;
    fetch('https://api.rephaserai.com/rephrase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: selectedText })
    })
    .then(response => response.json())
    .then(data => {
      chrome.runtime.sendMessage({ action: 'showPopup', text: data.rephrasedText });
    })
    .catch(error => console.error('Error:', error));
  }
});
