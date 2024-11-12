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

  overwriteButton.addEventListener('click', () => {
    const text = apiResponseContainer.textContent;
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'overwriteSelectedText',
          text: text
        }, (response) => {
          if (response && response.success) {
            overwriteButton.textContent = 'Done!';
            setTimeout(() => {
              window.parent.postMessage({action: 'closePopup'}, '*');
            }, 1000);
          } else {
            overwriteButton.textContent = 'Error';
            setTimeout(() => {
              overwriteButton.textContent = 'Overwrite';
            }, 2000);
          }
        });
      }
    });
  });

  // Handle ignore button click
  const ignoreButton = document.getElementById('ignoreButton');
  ignoreButton.addEventListener('click', () => {
    window.parent.postMessage({action: 'closePopup'}, '*');
  });
});
