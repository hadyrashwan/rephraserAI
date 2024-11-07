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
    const GOOGLE_API_KEY = 'AIzaSyCR4Y7xry-5rz_m4IY51J2urBsAGsVw35o';

    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: selectedText }]
        }]
      })
    })
    .then(response => response.json())
    .then(data => {
      const rephrasedText = data.candidates[0].content.parts[0].text;
      chrome.runtime.sendMessage({ action: 'showPopup', text: rephrasedText });
    })
    .catch(error => console.error('Error:', error));
  }
});
