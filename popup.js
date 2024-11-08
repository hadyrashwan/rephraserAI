document.addEventListener('DOMContentLoaded', () => {
  const rephrasedTextElement = document.getElementById('rephrasedText');
  const copyButton = document.getElementById('copyButton');
  const apiKeyInput = document.getElementById('apiKey');
  const modelInput = document.getElementById('model');
  const saveButton = document.getElementById('saveButton');

  // Load saved API key and model from Chrome storage
  chrome.storage.sync.get(['apiKey', 'model'], (data) => {
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey;
    }
    if (data.model) {
      modelInput.value = data.model;
    }
  });

  // Save API key and model to Chrome storage
  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    const model = modelInput.value;
    chrome.storage.sync.set({ apiKey, model }, () => {
      alert('API Key and Model saved successfully');
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
});
