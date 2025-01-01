


import { handleRephrase } from './backgroundHelpers'

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "rephrase",
    title: "Rephrase with RephraserAI",
    contexts: ["selection"]
  });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "show-rephraser") {
    handleRephrase();
  }
});

chrome.contextMenus.onClicked.addListener((info, _tab) => {
  if (info.menuItemId === "rephrase") {
    handleRephrase();
  }
});


var rebuildRules = undefined;

if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {

}