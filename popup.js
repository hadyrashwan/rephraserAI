document.addEventListener('DOMContentLoaded', () => {
  const rephrasedTextElement = document.getElementById('rephrasedText');
  const copyButton = document.getElementById('copyButton');
  const apiKeyInput = document.getElementById('apiKey');
  const modelInput = document.getElementById('model');
  const baseUrlInput = document.getElementById('baseUrl');
  const tokenInput = document.getElementById('token');
  const apiTypeSelect = document.getElementById('apiType');
  const saveButton = document.getElementById('saveButton');
  const runOllamaButton = document.getElementById('runOllamaButton');

  // Load saved API key, model, base URL, token, and API type from Chrome storage
  chrome.storage.sync.get(['apiKey', 'model', 'baseUrl', 'token', 'apiType'], (data) => {
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey;
    }
    if (data.model) {
      modelInput.value = data.model;
    }
    if (data.baseUrl) {
      baseUrlInput.value = data.baseUrl;
    }
    if (data.token) {
      tokenInput.value = data.token;
    }
    if (data.apiType) {
      apiTypeSelect.value = data.apiType;
    }
  });

  // Save API key, model, base URL, token, and API type to Chrome storage
  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    const model = modelInput.value;
    const baseUrl = baseUrlInput.value;
    const token = tokenInput.value;
    const apiType = apiTypeSelect.value;
    chrome.storage.sync.set({ apiKey, model, baseUrl, token, apiType }, () => {
      alert('API Key, Model, Base URL, Token, and API Type saved successfully');
    });
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

  // Handle running Ollama locally
  runOllamaButton.addEventListener('click', () => {
    // Add logic to run Ollama locally
    alert('Running Ollama locally...');
  });
});
