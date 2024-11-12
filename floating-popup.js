document.addEventListener('DOMContentLoaded', () => {
  const suggestionsContainer = document.getElementById('suggestions');
  const closeButton = document.querySelector('.close-button');
  const ignoreButton = document.querySelector('.ignore-button');

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
});
