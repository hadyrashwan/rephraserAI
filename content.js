
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
  
  // Ensure the popup doesn't go off-screen
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const popupWidth = 300;
  const popupHeight = 150;

  let adjustedX = x;
  let adjustedY = y;

  if (x + popupWidth > windowWidth) {
    adjustedX = windowWidth - popupWidth - 10; // 10px margin from the right edge
  }
  if (y + popupHeight > windowHeight) {
      adjustedY = y - popupHeight - 10; // 10px margin from the bottom edge, position above
      if(adjustedY < 0){
        adjustedY = 10; // 10px margin from the top edge
      }
  }

  floatingPopup.style.left = `${adjustedX}px`;
  floatingPopup.style.top = `${adjustedY}px`;
  floatingPopup.style.width = '300px';
  floatingPopup.style.height = '150px';
  floatingPopup.style.border = 'none';
  floatingPopup.style.zIndex = '2147483647';
  document.body.appendChild(floatingPopup);
  return floatingPopup;
}chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showFloatingPopup' || message.action === 'showApiResponse') {
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
    sendResponse({received: true});
    return true;
  }
});
