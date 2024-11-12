document.addEventListener('DOMContentLoaded', () => {
  const suggestionsContainer = document.getElementById('suggestions');
  const closeButton = document.querySelector('.close-button');
  const ignoreButton = document.querySelector('.ignore-button');
  const copyButton = document.getElementById('copyButton');
  const overwriteButton = document.getElementById('overwriteButton');

  // Get suggestions from the parent window
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showSuggestions') {
      const suggestions = request.suggestions;
      suggestionsContainer.innerHTML = '';
      
      suggestions.forEach(suggestion => {
        const button = document.createElement('button');
        button.className = 'suggestion-button';
        button.textContent = suggestion;
        button.addEventListener('click', () => {
          chrome.runtime.sendMessage({
            action: 'applySuggestion',
            suggestion: suggestion
          });
        });
        suggestionsContainer.appendChild(button);
      });
    }
  });

  closeButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'closeFloatingPopup' });
  });

  ignoreButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'closeFloatingPopup' });
  });

  copyButton.addEventListener('click', () => {
    const text = document.querySelector('#suggestions .suggestion-button').textContent;
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
