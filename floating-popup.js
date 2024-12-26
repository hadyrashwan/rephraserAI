document.addEventListener('DOMContentLoaded', () => {
  const apiResponseContainer = document.getElementById('apiResponse');
  const copyButton = document.getElementById('copyButton');

  // Retrieve text from local storage
  chrome.storage.local.get(['popupData'], (result) => {
    if (result.popupData) {
      apiResponseContainer.textContent = result.popupData;
      copyButton.disabled = false;
    }
  });

  copyButton.addEventListener('click', () => {
    const text = apiResponseContainer.textContent;
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      copyButton.textContent = 'Copied!';
    } catch (err) {
      console.error('Failed to copy text:', err);
      copyButton.textContent = 'Error';
    } finally {
      document.body.removeChild(textArea);
      setTimeout(() => {
        copyButton.textContent = 'Copy';
      }, 2000);
    }
  });

  // Handle ignore button click
  const ignoreButton = document.getElementById('ignoreButton');
  ignoreButton.addEventListener('click', () => {
    window.parent.postMessage({action: 'closePopup'}, '*');
  });
});
