console.log('Floating popup script loaded');
document.addEventListener('DOMContentLoaded', () => {
  console.log('Floating popup DOM loaded');
  const apiResponseContainer = document.getElementById('apiResponse');
  const copyButton = document.getElementById('copyButton');
  const replaceButton = document.getElementById('replaceButton');

  // Retrieve text from local storage
  chrome.storage.local.get(['popupData'], (result) => {
    if (result.popupData) {
      apiResponseContainer.textContent = result.popupData;
      copyButton.disabled = false;
      replaceButton.disabled = false;
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

  // Handle replace button click
  replaceButton.addEventListener('click', () => {
    const text = apiResponseContainer.textContent;
    
    // Send message to parent window to replace text
    window.parent.postMessage({
      action: 'replaceText', 
      text: text
    }, '*');

    replaceButton.textContent = 'Replaced!';
    setTimeout(() => {
      replaceButton.textContent = 'Replace';
      window.parent.postMessage({action: 'closePopup'}, '*');
    }, 2000);
  });

  // Handle ignore button click
  const ignoreButton = document.getElementById('ignoreButton');
  ignoreButton.addEventListener('click', () => {
    window.parent.postMessage({action: 'closePopup'}, '*');
  });
});
