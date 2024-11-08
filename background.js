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

    // Load API key and model from Chrome storage
    chrome.storage.sync.get(['apiKey', 'model'], (data) => {
      const apiKey = data.apiKey || 'AIzaSyCR4Y7xry-5rz_m4IY51J2urBsAGsVw35o';
      const model = data.model || 'gemini-1.5-flash';

      fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Fix the English and rephrase the following text: ${selectedText}` }]
          }]
        })
      })
      .then(response => response.json())
      .then(data => {
        const rephrasedText = data.candidates[0].content.parts[0].text;

        // Store the rephrased text first
        chrome.storage.local.set({ 'popupData': rephrasedText }, () => {
          // Then open the popup
          chrome.windows.create({
            url: 'popup.html',
            type: 'popup',
            width: 400,
            height: 300,
            focused: true
          });
        });
      })
      .catch(error => console.error('Error:', error));
    });
  }
});
