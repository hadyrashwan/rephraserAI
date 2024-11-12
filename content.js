chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  if (request.action === 'overwriteSelectedText') {
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
        try {
          range.deleteContents();
          const textNode = document.createTextNode(request.text);
          range.insertNode(textNode);
          
          console.log('Text successfully replaced');
          sendResponse({success: true});
          return true;
        } catch (error) {
          console.error('Error replacing text:', error);
          sendResponse({success: false, error: error.toString()});
          return false;
        }
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
  }
});
