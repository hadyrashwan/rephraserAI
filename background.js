chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "rephrase",
    title: "Rephrase with RephraserAI",
    contexts: ["selection"]
  });
});

// Helper function to generate suggestion variations
function generateSuggestions(text) {
  // For now, return some sample suggestions
  // In a real implementation, this would use AI or other logic
  return [text, 'for', 'form', 'fort', 'flora'];
}

chrome.contextMenus.onClicked.addListener((info, _tab) => {
  if (info.menuItemId === "rephrase") {
    const selectedText = info.selectionText;

    // Load API key/token, model, base URL, and API type from Chrome storage
    chrome.storage.sync.get(['apiKey', 'model', 'baseUrl', 'apiType'], (data) => {
      const apiKey = data.apiKey;
      const model = data.model || 'gemini-1.5-flash';
      const baseUrl = data.baseUrl || 'https://api.openai.com';
      const apiType = data.apiType || 'gemini';

      let requestBody;
      let requestUrl;

      if(apiType === 'gemini' && !data.apiKey ){
        requestUrl = `https://rephraserai.deno.dev/gemini/default`;
        requestBody = JSON.stringify({
          contents: [{
            parts: [{ text: `Please fix the grammar, spelling, and rephrase the following text: ${selectedText}` }]
          }]
        });
      }

      else if (apiType === 'gemini') {
        requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        requestBody = JSON.stringify({
          contents: [{
            parts: [{ text: `Please fix the grammar, spelling, and rephrase the following text: ${selectedText}` }]
          }]
        });
      } else if (apiType === 'openai') {
        requestUrl = `${baseUrl}/completions`;
        requestBody = JSON.stringify({
          model: model,
          prompt: `Please fix the grammar, spelling, and rephrase the following text: ${selectedText}`,
          max_tokens: 150
        });
      }

      const headers = {
        'Content-Type': 'application/json'
      };

      // Add Authorization header only for OpenAI
      if (apiType === 'openai') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      // Set referrerPolicy to "no-referrer" if base URL contains localhost
      const options = {
        method: 'POST',
        headers: headers,
        body: requestBody
      };

      if (baseUrl.includes('localhost')) {
        options.referrerPolicy = 'no-referrer';
        // Apply dynamic rules to modify headers
        rebuildRules('localhost');
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

        // Store the rephrased text
        chrome.storage.local.set({ 'popupData': rephrasedText });

        // Get the active tab to send suggestions to the floating popup
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          if (tabs[0]) {
            // Send message to content script to show floating popup
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'showFloatingPopup'
            });

            // Generate some variations as suggestions
            const suggestions = generateSuggestions(selectedText);
            
            // Wait a bit for the popup to be created
            setTimeout(() => {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: 'showSuggestions',
                suggestions: suggestions
              });
            }, 100);
          }
        });
      })
      .catch(error => console.error('Error:', error));
    });
  }
});

var rebuildRules = undefined;
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {
    rebuildRules = async function (domain) {
        const domains = [domain];
        /** @type {chrome.declarativeNetRequest.Rule[]} */
        const rules = [{
            id: 1,
            condition: {
                requestDomains: domains
            },
            action: {
                type: 'modifyHeaders',
                requestHeaders: [{
                    header: 'origin',
                    operation: 'set',
                    value: `http://${domain}`,
                }],
            },
        }];
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: rules.map(r => r.id),
            addRules: rules,
        });
    }
}
