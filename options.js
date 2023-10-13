'use strict';

function saveOptions() {
  //Get data by element ids.
	let leftPanel = document.getElementById('leftPanelId').value;
	let rightPanel = document.getElementById('rightPanelId').value;
	let proccessedColor = document.getElementById('proccessedColorId').value;
	let apiKey = document.getElementById('apiKeyId').value;
	let removeOldBadges = document.getElementById('removeOldBadgesId').checked;
	let skills = [];
	let list = document.getElementById('skillData').getElementsByTagName('li');
	for (let i = 0; i < list.length; i++)
	{
		let skill = { Name: '', SearchInDescription: false };
		skill.Name = list[i].firstChild.value;
		skill.SearchInDescription = list[i].querySelectorAll('input[type=checkbox]')[0].checked;
		skills.push(skill);
	}
	chrome.storage.sync.set({
		proccessedColor: proccessedColor,
		apiKey: apiKey,
		removeOldBadges: removeOldBadges,
		leftPanel: leftPanel,
		rightPanel: rightPanel,
		skills:skills
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

//remove li element from list
function removeSkill(data){
    this.parentElement.remove();
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  chrome.storage.sync.get({
    proccessedColor: '#e6ffff',
    apiKey: '',
    removeOldBadges: false,
	leftPanel: 50,
	rightPanel: 50,
	skills:[{Name:'.net',SearchInDescription: true},{Name:'c#',SearchInDescription: false},{Name:'vue',SearchInDescription: true}]
  }, function (items) {
   document.getElementById('apiKeyId').value = items.apiKey;
   document.getElementById('proccessedColorId').value = items.proccessedColor;
   document.getElementById('proccessedColorDivId').style.color = items.proccessedColor;
   document.getElementById('rightPanelId').value =  items.rightPanel;
   document.getElementById('leftPanelId').value = items.leftPanel;
   document.getElementById('removeOldBadgesId').checked =  items.removeOldBadges;

   for(const skill of items.skills)
   {
	   addNewElement(skill.Name, skill.SearchInDescription);
   }
  });
}

//add new li element
function addNewElement(skill, searchInDescription){
	   let elem = document.createElement("li");
	   let input = document.createElement("input");
	   input.value = skill;
	   elem.appendChild(input);
	   let label = document.createElement("label");
	   elem.appendChild(label);
	   let newCheckbox = document.createElement("input");
	   newCheckbox.type = "checkbox";
	   newCheckbox.checked = searchInDescription;
	   label.appendChild(newCheckbox);
	   let span = document.createElement("span");	 
	   span.innerHTML = "Search in description";
	   label.appendChild(span);
	   let removeButton = document.createElement("button");
	   removeButton.innerText = "remove";
	   removeButton.addEventListener('click',removeSkill);
	   elem.appendChild(removeButton);
	   document.getElementById('skillData').appendChild(elem);   
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click',
    saveOptions);
	document.getElementById('addRow').addEventListener('click', addNewElement.bind('','',false));
	
