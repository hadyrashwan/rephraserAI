document.addEventListener('DOMContentLoaded', () => {
  const rephrasedTextElement = document.getElementById('rephrasedText');
  const copyButton = document.getElementById('copyButton');
  const overwriteButton = document.getElementById('overwriteButton');
  const apiKeyInput = document.getElementById('apiKey');
  const modelInput = document.getElementById('model');
  const baseUrlInput = document.getElementById('baseUrl');
  const apiTypeSelect = document.getElementById('apiType');
  const saveButton = document.getElementById('saveButton');
  const settingsForm = document.getElementById('settingsForm');

  // Load saved API key/token, model, base URL, and API type from Chrome storage
  chrome.storage.sync.get(['apiKey', 'model', 'baseUrl', 'apiType'], (data) => {
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey;
    }
    if (data.model) {
      modelInput.value = data.model;
    }
    if (data.baseUrl) {
      baseUrlInput.value = data.baseUrl;
    }
    if (data.apiType) {
      apiTypeSelect.value = data.apiType;
    }
  });

  // Save API key/token, model, base URL, and API type to Chrome storage
  settingsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const apiKey = apiKeyInput.value;
    const model = modelInput.value;
    const baseUrl = baseUrlInput.value;
    const apiType = apiTypeSelect.value;
    chrome.storage.sync.set({ apiKey, model, baseUrl, apiType });
  });

  // Load the rephrased text from Chrome storage
  chrome.storage.local.get(['popupData'], (result) => {
    if (result.popupData) {
      rephrasedTextElement.value = result.popupData;
    }
  });

  copyButton.addEventListener('click', () => {
    rephrasedTextElement.select();
    document.execCommand('copy');
    copyButton.textContent = 'Copied';
    setTimeout(() => {
      copyButton.textContent = 'Copy';
    }, 2000);
  });

  overwriteButton.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      console.log('Sending overwrite message to tab:', tabs[0].id);
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'overwriteSelectedText',
        text: rephrasedTextElement.value
      }, (response) => {
        console.log('Overwrite response:', response);
        if (response && response.success) {
          overwriteButton.textContent = 'Overwritten';
          setTimeout(() => {
            overwriteButton.textContent = 'Overwrite';
          }, 2000);
        } else {
          console.error('Overwrite failed:', response);
          overwriteButton.textContent = 'Failed';
          setTimeout(() => {
            overwriteButton.textContent = 'Overwrite';
          }, 2000);
        }
      });
    });
  });
});
