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

    // Load API key, model, base URL, token, and API type from Chrome storage
    chrome.storage.sync.get(['apiKey', 'model', 'baseUrl', 'token', 'apiType'], (data) => {
      const apiKey = data.apiKey || 'AIzaSyCR4Y7xry-5rz_m4IY51J2urBsAGsVw35o';
      const model = data.model || 'gemini-1.5-flash';
      const baseUrl = data.baseUrl || 'https://api.openai.com';
      const token = data.token || '';
      const apiType = data.apiType || 'gemini';

      let requestBody;
      let requestUrl;

      if (apiType === 'gemini') {
        requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        requestBody = JSON.stringify({
          contents: [{
            parts: [{ text: `Please fix the grammar, spelling, and rephrase the following text: ${selectedText}` }]
          }]
        });
      } else if (apiType === 'openai') {
        requestUrl = `${baseUrl}/v1/completions`;
        requestBody = JSON.stringify({
          model: model,
          prompt: `Please fix the grammar, spelling, and rephrase the following text: ${selectedText}`,
          max_tokens: 150
        });
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Set referrerPolicy to "no-referrer" if base URL contains localhost
      const options = {
        method: 'POST',
        headers: headers,
        body: requestBody
      };

      if (baseUrl.includes('localhost')) {
        options.referrerPolicy = 'no-referrer';
      }

      fetch(requestUrl, options)
      .then(response => response.json())
      .then(data => {
        let rephrasedText;
        if (apiType === 'gemini') {
          rephrasedText = data.candidates[0].content.parts[0].text;
        } else if (apiType === 'openai') {
          rephrasedText = data.choices[0].text.trim();
        }

        // Store the rephrased text first
        chrome.storage.local.set({ 'popupData': rephrasedText }, () => {
          // Then open the popup
          chrome.action.openPopup();
        });
      })
      .catch(error => console.error('Error:', error));
    });
  }
});
