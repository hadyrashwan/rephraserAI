// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "show-rephraser") {
    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
      if (tabs[0]) {
        // Execute script to get selected text
        const [{result}] = await chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          function: () => window.getSelection().toString()
        });
        
        const selectedText = result;
        if (selectedText) {
          chrome.storage.sync.get(['apiKey', 'model', 'baseUrl', 'apiType'], (data) => {
            makeRephrasingRequest(selectedText, data)
              .then(rephrasedText => {
                chrome.storage.local.set({ 'popupData': rephrasedText });

                chrome.tabs.sendMessage(tabs[0].id, {
                  action: 'showFloatingPopup'
                });

                setTimeout(() => {
                  chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'showApiResponse',
                    response: rephrasedText
                  });
                }, 100);
              })
              .catch(error => console.error('Error:', error));
          });
        }
      }
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "rephrase",
    title: "Rephrase with RephraserAI",
    contexts: ["selection"]
  });
});


// Shared function for API request
function makeRephrasingRequest(selectedText, data) {
  const apiKey = data.apiKey;
  const model = data.model || 'gemini-1.5-flash';
  const baseUrl = data.baseUrl || 'https://api.openai.com';
  const apiType = data.apiType || 'gemini';

  let requestBody;
  let requestUrl;

  const prompt = `You are a rephrasing tool designed to improve the clarity and correctness of text. Your task is to take the given text, fix any spelling and grammar issues, and make it easier to understand while maintaining its original meaning. Here's what you need to do:

1. First, carefully read the following text:

<original_text>
${selectedText}
</original_text>

2. Now, follow these steps to rephrase the text:
   a. Correct any spelling errors.
   b. Fix grammatical mistakes.
   c. Simplify complex sentences or phrases to improve clarity.
   d. Ensure the rephrased text maintains the original meaning.
   e. Make the text more concise if possible, without losing important information.

3. Provide your rephrased version of the text. Do not include any explanations, comments, or additional information. Simply output the improved text.

Remember, your goal is to make the text clearer and more correct while preserving its original message. Do not add new information or change the intended meaning of the original text.

Output your rephrased text directly, without any additional formatting or tags.`

  if(apiType === 'gemini' && !data.apiKey ){
    requestUrl = `https://rephraserai.deno.dev/gemini/default`;
    requestBody = JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    });
  }
  else if (apiType === 'gemini') {
    requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    requestBody = JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    });
  } else if (apiType === 'openai') {
    requestUrl = `${baseUrl}/completions`;
    requestBody = JSON.stringify({
      model: model,
      prompt: prompt,
      max_tokens: 150
    });
  }

  const headers = {
    'Content-Type': 'application/json'
  };

  if (apiType === 'openai') {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const options = {
    method: 'POST',
    headers: headers,
    body: requestBody
  };

  if (baseUrl.includes('localhost')) {
    options.referrerPolicy = 'no-referrer';
    rebuildRules('localhost');
  }

  return fetch(requestUrl, options)
    .then(response => response.json())
    .then(data => {
      let rephrasedText;
      if (apiType === 'gemini') {
        rephrasedText = data.candidates[0].content.parts[0].text;
      } else if (apiType === 'openai') {
        rephrasedText = data.choices[0].text.trim();
      }
      return rephrasedText;
    });
}

chrome.contextMenus.onClicked.addListener((info, _tab) => {
  if (info.menuItemId === "rephrase") {
    const selectedText = info.selectionText;

    chrome.storage.sync.get(['apiKey', 'model', 'baseUrl', 'apiType'], (data) => {
      makeRephrasingRequest(selectedText, data)
        .then(rephrasedText => {
          chrome.storage.local.set({ 'popupData': rephrasedText });

          chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: 'showFloatingPopup'
              });

              setTimeout(() => {
                chrome.tabs.sendMessage(tabs[0].id, {
                  action: 'showApiResponse',
                  response: rephrasedText
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
