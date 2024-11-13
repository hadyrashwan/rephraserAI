console.log('Floating popup script loaded');
document.addEventListener('DOMContentLoaded', () => {
  console.log('Floating popup DOM loaded');
  const apiResponseContainer = document.getElementById('apiResponse');
  let text
  const copyButton = document.getElementById('copyButton');
  const overwriteButton = document.getElementById('overwriteButton');

  // Get API response from the background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Floating popup received message:', request);
    if (request.action === 'showApiResponse') {
      console.log('Showing API response:', request.response);
      apiResponseContainer.textContent = request.response;
      copyButton.disabled = false;
      overwriteButton.disabled = false;
    }
  });

    // Load the rephrased text from Chrome storage
    chrome.storage.local.get(['popupData'], (result) => {
      if (result.popupData) {
        text = result.popupData;
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
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (!tabs || tabs.length === 0) {
        console.error('No active tab found');
        overwriteButton.textContent = 'Error';
        setTimeout(() => {
          overwriteButton.textContent = 'Overwrite';
        }, 2000);
        return;
      }

      console.log('Sending overwrite message to tab:', tabs[0].id);
      
      // Check if the content script is ready
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'overwriteSelectedText',
        text: apiResponseContainer.textContent
      }, (response) => {
        // Check for runtime.lastError first
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
          overwriteButton.textContent = 'Connection Error';
          setTimeout(() => {
            overwriteButton.textContent = 'Overwrite';
          }, 2000);
          return;
        }

        console.log('Overwrite response:', response);
        if (response && response.success) {
          overwriteButton.textContent = 'Overwritten';
          setTimeout(() => {
            overwriteButton.textContent = 'Overwrite';
            window.parent.postMessage({action: 'closePopup'}, '*');
          }, 2000);
        } else {
          console.error('Overwrite failed:', response);
          overwriteButton.textContent = 'Failed';
          setTimeout(() => {
            overwriteButton.textContent = 'Overwrite';
          }, 2000);
        }
      });
    });
  });

  // Handle ignore button click
  const ignoreButton = document.getElementById('ignoreButton');
  ignoreButton.addEventListener('click', () => {
    window.parent.postMessage({action: 'closePopup'}, '*');
  });
});
