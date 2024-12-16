// Handle keyboard shortcut
chrome.commands.onCommand.addListener(async (command) => {
  log.info('Command', command);

  if (command === "show-rephraser") {
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab?.id) {
        // Execute script to get the selected text
        const [{ result: selectedText }] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => window.getSelection()?.toString() || ''
        });

        if (!selectedText) {
          log.warn('No text selected');
          return;
        }

        // Retrieve API settings from storage
        const data = await chrome.storage.sync.get(['apiKey', 'model', 'baseUrl', 'apiType']);

        // Make the rephrasing request
        const rephrasedText = await makeRephrasingRequest(selectedText, data);

        // Save the rephrased text to local storage
        await chrome.storage.local.set({ popupData: rephrasedText });

        // Notify the content script to display the floating popup and response
        await chrome.tabs.sendMessage(tab.id, { action: 'showFloatingPopup' });
        await chrome.tabs.sendMessage(tab.id, {
          action: 'showApiResponse',
          response: rephrasedText
        });
      }
    } catch (error) {
      console.error('Error in command handler:', error);
    }
  }
});


chrome.runtime.onInstalled.addListener(() => {
  log.info('Install', 'Creating context menu');
  chrome.contextMenus.create({
    id: "rephrase",
    title: "Rephrase with RephraserAI",
    contexts: ["selection"]
  });
});


// Shared function for API request
function makeRephrasingRequest(selectedText, data) {
  log.info('Request', {
    apiType: data.apiType,
    model: data.model,
    hasApiKey: !!data.apiKey
  });

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
    .then(response => {
      log.info('Response', response.status);
      return response.json();
    })
    .then(data => {
      let rephrasedText;
      if (apiType === 'gemini') {
        rephrasedText = data.candidates[0].content.parts[0].text;
      } else if (apiType === 'openai') {
        rephrasedText = data.choices[0].text.trim();
      }
      return rephrasedText;
    })
    .catch(error => {
      log.error('Fetch', error);
      throw error;
    });
}

chrome.contextMenus.onClicked.addListener( (info, _tab) => {
  log.info('ContextMenu', info.menuItemId);
  if (info.menuItemId === "rephrase") {
    const selectedText = info.selectionText;

    chrome.storage.sync.get(['apiKey', 'model', 'baseUrl', 'apiType'], async(data) => {
      try{

        const rephrasedText = await makeRephrasingRequest(selectedText, data)
        chrome.storage.local.set({ 'popupData': rephrasedText });
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab?.id) {
          // Notify content script to show the floating popup
          await chrome.tabs.sendMessage(tab.id, { action: 'showFloatingPopup' });
          
          // Notify content script with the API response
          await chrome.tabs.sendMessage(tab.id, { action: 'showApiResponse', response: rephrasedText });
        }
        
      } catch (error) {
        console.error('Error:', error);
      }
    });
  }
});

var rebuildRules = undefined;
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {
    rebuildRules = async function (domain) {
        log.info('Rules', `Rebuilding for ${domain}`);
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
// Simple logging wrapper
const log = {
  info: (tag, data) => console.log(`[${tag}]`, data),
  error: (tag, data) => console.error(`[${tag}]`, data)
};

// Add essential logs to key points
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  log.info('Message', request.action);
  
  if (request.action === 'rephrase') {
    chrome.storage.sync.get(['apiKey', 'model', 'baseUrl', 'apiType'], (data) => {
      makeRephrasingRequest(request.text, data)
        .then(rephrasedText => {
          log.info('Success', 'Rephrasing completed');
          chrome.storage.local.set({ 'popupData': rephrasedText });
          sendResponse({ success: true, rephrasedText });
        })
        .catch(error => {
          log.error('API Error', error);
          sendResponse({ success: false, error: error.toString() });
        });
    });
    return true; // Indicates async response
  }
});