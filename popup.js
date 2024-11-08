document.addEventListener('DOMContentLoaded', () => {
  const rephrasedTextElement = document.getElementById('rephrasedText');
  const copyButton = document.getElementById('copyButton');
  const apiKeyInput = document.getElementById('apiKey');
  const modelInput = document.getElementById('model');
  const baseUrlInput = document.getElementById('baseUrl');
  const tokenInput = document.getElementById('token');
  const saveButton = document.getElementById('saveButton');
  const runOllamaButton = document.getElementById('runOllamaButton');

  // Load saved API key, model, base URL, and token from Chrome storage
  chrome.storage.sync.get(['apiKey', 'model', 'baseUrl', 'token'], (data) => {
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
  });

  // Save API key, model, base URL, and token to Chrome storage
  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    const model = modelInput.value;
    const baseUrl = baseUrlInput.value;
    const token = tokenInput.value;
    chrome.storage.sync.set({ apiKey, model, baseUrl, token }, () => {
      alert('API Key, Model, Base URL, and Token saved successfully');
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
