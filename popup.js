'use strict';
let clicker = document.getElementById('clicker');

// When the button is clicked, call injected script
 clicker.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
     chrome.scripting.executeScript({target: { tabId: tab.id }, function: callInjectedScript});
 });


// The body of this function will be executed as a content script inside the
function callInjectedScript() {
		  chrome.storage.sync.get({
    proccessedColor: '#e6ffff',
	apiKey: '',
    removeOldBadges: false,
	leftPanel: 50,
	rightPanel: 50,
	skills:[{name:'.net',searchInDescription: true},{name:'c#',searchInDescription: false},{name:'vue',searchInDescription: true}]
  }, function(items) {
	  if(window.location.href.indexOf("pracuj") > 0)
	  {
		document.dispatchEvent(new CustomEvent('pracujplInjectedEvent', {detail:items}));
	  }
	  else
	  {
		document.dispatchEvent(new CustomEvent('justJoinItInjectedEvent', {detail:items}));
	  }
  });
}