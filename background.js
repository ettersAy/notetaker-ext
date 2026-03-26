chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({ notes: [] }, function() {
    console.log('Extension initialized');
  });
});