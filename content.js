chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'overwriteSelectedText') {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();

      if (selectedText) {
        range.deleteContents();
        const textNode = document.createTextNode(request.text);
        range.insertNode(textNode);
        sendResponse({success: true});
        return true;
      }
    }
    sendResponse({success: false});
    return true;
  }
});
