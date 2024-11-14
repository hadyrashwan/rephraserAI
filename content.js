// Ensure content script is ready and listening
console.log('RephraserAI Content Script Loaded');

// Add debug logging for keyboard events
document.addEventListener('keydown', (e) => {
  console.log('Key pressed:', e.key, 'Meta:', e.metaKey, 'Ctrl:', e.ctrlKey);
});

// Handle keyboard shortcut
document.addEventListener('keydown', (event) => {
  // Check for Cmd+U on Mac or Ctrl+U on Windows/Linux
  if ((event.metaKey || event.ctrlKey) && event.key === 'u') {
    event.preventDefault(); // Prevent default browser behavior
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (selectedText.length > 0) {
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
        }

        console.log('Making API request to:', requestUrl);
        return fetch(requestUrl, options)
        .then(response => {
          console.log('API response status:', response.status);
          return response.json();
        })
        .then(data => {
          console.log('API response data:', data);
          let rephrasedText;
          if (apiType === 'gemini') {
            rephrasedText = data.candidates[0].content.parts[0].text;
          } else if (apiType === 'openai') {
            rephrasedText = data.choices[0].text.trim();
          }

          // Store the rephrased text
          chrome.storage.local.set({ 'popupData': rephrasedText });

          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const scrollX = window.scrollX || window.pageXOffset;
          const scrollY = window.scrollY || window.pageYOffset;
          
          // Position popup below the selection
          const x = rect.left + scrollX;
          const y = rect.bottom + scrollY + 5; // 5px gap
          
          createFloatingPopup(x, y);
        })
        .catch(error => console.error('Error:', error));
      });
    }
  }
});

let floatingPopup = null;

// Listen for messages from the floating popup iframe
window.addEventListener('message', (event) => {
  if (event.data.action === 'closePopup' && floatingPopup) {
    document.body.removeChild(floatingPopup);
    floatingPopup = null;
  }
  
  // Removed replace text handling
});

// Close popup when clicking outside
document.addEventListener('click', (event) => {
  if (floatingPopup && !floatingPopup.contains(event.target)) {
    document.body.removeChild(floatingPopup);
    floatingPopup = null;
  }
});

// Function to create and position the floating popup
function createFloatingPopup(x, y) {
  if (floatingPopup) {
    document.body.removeChild(floatingPopup);
  }

  floatingPopup = document.createElement('iframe');
  floatingPopup.src = chrome.runtime.getURL('floating-popup.html');
  floatingPopup.style.position = 'absolute';
  floatingPopup.style.left = `${x}px`;
  floatingPopup.style.top = `${y}px`;
  floatingPopup.style.width = '300px';
  floatingPopup.style.height = '150px';
  floatingPopup.style.border = 'none';
  floatingPopup.style.zIndex = '2147483647';
  document.body.appendChild(floatingPopup);
  return floatingPopup;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showFloatingPopup') {
    const selection = window.getSelection();
    if (selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      
      // Position popup below the selection
      const x = rect.left + scrollX;
      const y = rect.bottom + scrollY + 5; // 5px gap
      
      createFloatingPopup(x, y);
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  // Add a check to ensure the message is from the extension
  if (!sender.id || sender.id !== chrome.runtime.id) {
    console.error('Message from unauthorized source');
    sendResponse({success: false, error: 'Unauthorized message source'});
    return false;
  }
  
  if (request.action === 'overwriteSelectedText') {
    // Wrap the entire logic in a try-catch for more comprehensive error handling
    try {
      // Try multiple methods to get selection
      const selection = window.getSelection();
      const activeElement = document.activeElement;

      console.log('Selection:', selection);
      console.log('Active Element:', activeElement);

      // Check if active element is an input or textarea
      if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;
        
        if (start !== undefined && end !== undefined) {
          const currentValue = activeElement.value;
          activeElement.value = currentValue.slice(0, start) + request.text + currentValue.slice(end);
          
          console.log('Text replaced in input/textarea');
          sendResponse({success: true});
          return true;
        }
      }

      // Fallback to standard selection replacement
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = selection.toString();

        console.log('Selected text:', selectedText);
        console.log('Replacement text:', request.text);

        if (selectedText) {
          range.deleteContents();
          const textNode = document.createTextNode(request.text);
          range.insertNode(textNode);
          
          console.log('Text successfully replaced');
          sendResponse({success: true});
          return true;
        }
      }

      // If no selection or input method works, try contenteditable
      const editableElement = document.querySelector('[contenteditable="true"]');
      if (editableElement) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editableElement);
        selection.removeAllRanges();
        selection.addRange(range);

        document.execCommand('insertText', false, request.text);
        
        console.log('Text replaced in contenteditable');
        sendResponse({success: true});
        return true;
      }

      console.error('Unable to replace text: No suitable element found');
      sendResponse({success: false, error: 'No suitable element found for text replacement'});
      return false;
    } catch (error) {
      console.error('Unexpected error in overwrite process:', error);
      sendResponse({success: false, error: error.toString()});
      return false;
    }
  }
  
  // Return true to indicate the listener will send a response asynchronously
  return true;
});

// Confirm content script is fully loaded
window.addEventListener('load', () => {
  console.log('RephraserAI Content Script fully loaded');
});
