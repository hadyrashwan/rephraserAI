document.addEventListener('DOMContentLoaded', () => {
  const suggestionsContainer = document.getElementById('suggestions');
  const copyButton = document.getElementById('copyButton');
  const overwriteButton = document.getElementById('overwriteButton');

  // Get suggestions from the background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showSuggestions') {
      const suggestions = request.suggestions;
      suggestionsContainer.innerHTML = '';
      
      // Create a div to hold all suggestion buttons
      const buttonsDiv = document.createElement('div');
      buttonsDiv.className = 'suggestion-buttons';
      
      suggestions.forEach(suggestion => {
        const button = document.createElement('button');
        button.className = 'suggestion-button';
        button.textContent = suggestion;
        button.addEventListener('click', () => {
          // Update selected suggestion
          document.querySelectorAll('.suggestion-button').forEach(btn => {
            btn.classList.remove('selected');
          });
          button.classList.add('selected');
          
          // Enable copy and overwrite buttons
          copyButton.disabled = false;
          overwriteButton.disabled = false;
        });
        buttonsDiv.appendChild(button);
      });
      
      suggestionsContainer.appendChild(buttonsDiv);
      
      // Initially disable action buttons until a suggestion is selected
      copyButton.disabled = true;
      overwriteButton.disabled = true;
    }
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
