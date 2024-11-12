// Ensure content script is ready and listening
console.log('RephraserAI Content Script Loaded');

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
