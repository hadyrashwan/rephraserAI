document.addEventListener('DOMContentLoaded', () => {
  const apiResponseContainer = document.getElementById('apiResponse');
  const copyButton = document.getElementById('copyButton');
  const overwriteButton = document.getElementById('overwriteButton');

  // Get API response from the background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showApiResponse') {
      apiResponseContainer.textContent = request.response;
      copyButton.disabled = false;
      overwriteButton.disabled = false;
    }
  });


  copyButton.addEventListener('click', () => {
    const text = apiResponseContainer.textContent;
    navigator.clipboard.writeText(text).then(() => {
      copyButton.textContent = 'Copied!';
      setTimeout(() => {
        copyButton.textContent = 'Copy';
      }, 2000);
    });
  });

  overwriteButton.addEventListener('click', () => {
    const text = document.querySelector('#suggestions .suggestion-button').textContent;
    chrome.runtime.sendMessage({
      action: 'overwriteSelectedText',
      text: text
    }, (response) => {
      if (response && response.success) {
        overwriteButton.textContent = 'Done!';
        setTimeout(() => {
          chrome.runtime.sendMessage({ action: 'closeFloatingPopup' });
        }, 1000);
      }
    });
  });
});
