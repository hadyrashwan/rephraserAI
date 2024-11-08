document.addEventListener('DOMContentLoaded', () => {
  const rephrasedTextElement = document.getElementById('rephrasedText');
  const copyButton = document.getElementById('copyButton');
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
});
