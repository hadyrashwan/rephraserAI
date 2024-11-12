// Ensure content script is ready and listening
console.log('RephraserAI Content Script Loaded');

// Handle keyboard shortcut
document.addEventListener('keydown', (event) => {
  // Check for Cmd+U on Mac or Ctrl+U on Windows/Linux
  if ((event.metaKey || event.ctrlKey) && event.key === 'u') {
    event.preventDefault(); // Prevent default browser behavior
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (selectedText.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      
      // Position popup below the selection
      const x = rect.left + scrollX;
      const y = rect.bottom + scrollY + 5; // 5px gap
      
      createFloatingPopup(x, y);
      
      // Store selected text
      chrome.storage.local.set({ 'popupData': selectedText });
    }
  }
});

let floatingPopup = null;

// Listen for messages from the floating popup iframe
window.addEventListener('message', (event) => {
  if (event.data.action === 'closePopup' && floatingPopup) {
    document.body.removeChild(floatingPopup);
    floatingPopup = null;
  }
});

// Close popup when clicking outside
document.addEventListener('click', (event) => {
  if (floatingPopup && !floatingPopup.contains(event.target)) {
    document.body.removeChild(floatingPopup);
    floatingPopup = null;
  }
});

// Function to create and position the floating popup
function createFloatingPopup(x, y) {
  if (floatingPopup) {
    document.body.removeChild(floatingPopup);
  }

  floatingPopup = document.createElement('iframe');
  floatingPopup.src = chrome.runtime.getURL('floating-popup.html');
  floatingPopup.style.position = 'absolute';
  floatingPopup.style.left = `${x}px`;
  floatingPopup.style.top = `${y}px`;
  floatingPopup.style.width = '300px';
  floatingPopup.style.height = '150px';
  floatingPopup.style.border = 'none';
  floatingPopup.style.zIndex = '2147483647';
  document.body.appendChild(floatingPopup);
  return floatingPopup;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showFloatingPopup') {
    const selection = window.getSelection();
    if (selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      
      // Position popup below the selection
      const x = rect.left + scrollX;
      const y = rect.bottom + scrollY + 5; // 5px gap
      
      createFloatingPopup(x, y);
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  // Add a check to ensure the message is from the extension
  if (!sender.id || sender.id !== chrome.runtime.id) {
    console.error('Message from unauthorized source');
    sendResponse({success: false, error: 'Unauthorized message source'});
    return false;
  }
  
  if (request.action === 'overwriteSelectedText') {
    // Wrap the entire logic in a try-catch for more comprehensive error handling
    try {
      const selection = window.getSelection();
      
      if (!selection) {
        console.error('No selection found');
        sendResponse({success: false, error: 'No selection'});
        return false;
      }
      
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = selection.toString();

        console.log('Selected text:', selectedText);
        console.log('Replacement text:', request.text);

        if (selectedText) {
          range.deleteContents();
          const textNode = document.createTextNode(request.text);
          range.insertNode(textNode);
          
          console.log('Text successfully replaced');
          sendResponse({success: true});
          return true;
        } else {
          console.error('No text selected');
          sendResponse({success: false, error: 'No text selected'});
          return false;
        }
      } else {
        console.error('No range found');
        sendResponse({success: false, error: 'No range found'});
        return false;
      }
    } catch (error) {
      console.error('Unexpected error in overwrite process:', error);
      sendResponse({success: false, error: error.toString()});
      return false;
    }
  }
  
  // Return true to indicate the listener will send a response asynchronously
  return true;
});

// Confirm content script is fully loaded
window.addEventListener('load', () => {
  console.log('RephraserAI Content Script fully loaded');
});
