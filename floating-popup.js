console.log('Floating popup script loaded');
document.addEventListener('DOMContentLoaded', () => {
  console.log('Floating popup DOM loaded');
  const apiResponseContainer = document.getElementById('apiResponse');
  let text
  const copyButton = document.getElementById('copyButton');

  // Get API response from the background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Floating popup received message:', request);
    if (request.action === 'showApiResponse') {
      console.log('Showing API response:', request.response);
      apiResponseContainer.textContent = request.response;
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
