document.addEventListener('DOMContentLoaded', () => {
  const rephrasedTextElement = document.getElementById('rephrasedText');
  const copyButton = document.getElementById('copyButton');

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showPopup') {
      rephrasedTextElement.value = request.text;
    }
  });

  copyButton.addEventListener('click', () => {
    rephrasedTextElement.select();
    document.execCommand('copy');
    alert('Text copied to clipboard');
  });
});
