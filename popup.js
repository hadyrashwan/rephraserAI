document.addEventListener('DOMContentLoaded', domContentLoaded());
export function domContentLoaded() {
  return () => {
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
    settingsForm.addEventListener('submit', saveListener(apiKeyInput, modelInput, baseUrlInput, apiTypeSelect, saveButton));

    // Load the rephrased text from Chrome storage
    chrome.storage.local.get(['popupData'], (result) => {
      if (result.popupData) {
        rephrasedTextElement.value = result.popupData;
      }
    });

    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(rephrasedTextElement.value);
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
        copyButton.textContent = 'Error';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      }
    });

  };
}

export function saveListener(apiKeyInput, modelInput, baseUrlInput, apiTypeSelect, saveButton) {
  return (event) => {
    event.preventDefault();
    const apiKey = apiKeyInput.value;
    const model = modelInput.value;
    const baseUrl = baseUrlInput.value;
    const apiType = apiTypeSelect.value;

    // Temporarily change save button text to provide feedback
    saveButton.textContent = 'Saving...';
    saveButton.disabled = true;

    chrome.storage.sync.set({ apiKey, model, baseUrl, apiType }, () => {
      saveButton.textContent = 'Saved!';

      // Revert back to original state after 2 seconds
      setTimeout(() => {
        saveButton.textContent = 'Save';
        saveButton.disabled = false;
      }, 2000);
    });
  };
}
