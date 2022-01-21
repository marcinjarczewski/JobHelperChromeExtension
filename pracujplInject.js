//Declare global variable. Can be used in the console.
PracujplHelper ={};
//Init function. Prepares the data and starts searching for rows.
PracujplHelper.run = function(inputData){	
	PracujplHelper.data = inputData;
	PracujplHelper.findRecord();
}

//Search for lines with job offers
PracujplHelper.findRecord = function(){	
	let list = $(".offer");
	for(let listElem of list)
	{		
		if(!$(listElem).hasClass("injected"))
		{
			let searchElement = {};
			let title = $(listElem).find("a.offer-details__title-link");
			if(title.length > 0)
			{
				searchElement = title[0];
			}
			else{
				searchElement =  $(listElem).find("a.offer-regions__label")[0];
			}
		    return PracujplHelper.proccessData(searchElement,listElem);
		};
	}
	
	//if each record was processed, wait 1 second and check again
	setTimeout(function() { PracujplHelper.findRecord(); }, 1000);
}

PracujplHelper.proccessData = function(linkContainer, offerContainer){	
    let url = linkContainer.href;
	//mark element as proccessed
	$(offerContainer).addClass("injected");

	success = function( result ) {
		if(!result){
			return "result error";
		}
		//search for target html containers
		let titleContainer = $(offerContainer).find(".offer-details")[0];
		let badgesContainer = $(offerContainer).find(".offer-labels")[0];
		//get skills from details
		let expectedSkills = GetSkillsArray(result.body,"[data-scroll-id*='technologies-expected-1']");
		let optionalSkills = GetSkillsArray(result.body,"[data-scroll-id*='technologies-optional-1']");
		
		
		//add first line badges
		if(result.englishEvaluation && result.englishEvaluation.length > 0)
		{
			$(titleContainer).append(CreateBadgeTemplate('language eval.:'+result.englishEvaluation, "tooltip"));
		}
		$(titleContainer).append(CreateBadgeTemplate('offer language:'+result.offerLanguage, ""));
		
		//set skill level with requirements
		AddSkillsToContainer("Optional", badgesContainer, optionalSkills, "optional");
		AddSkillsToContainer("Mandatory", badgesContainer, expectedSkills, "");
		if(PracujplHelper.data.skills){
			var descriptionText =  $(result.body).find("[data-scroll-id*='requirements-1']").text().toLowerCase();
			for(let skill of PracujplHelper.data.skills)
			{
				let state  = "none";
				let text = skill.Name;
				for(optionalSkill of optionalSkills)
				{
					if(optionalSkill.toLowerCase().indexOf(skill.Name.toLowerCase()) >= 0)
					{
						state = "success";
						text += "-optional";
						break;
					} 
				}
				for(expectedSkill of expectedSkills)
				{
					if(expectedSkill.toLowerCase().indexOf(skill.Name.toLowerCase())>= 0)
					{
						state = "success";
						text += "-mandatory";
						break;
					} 
				}
				
			    if(state == "none" && skill.SearchInDescription)
				{
					if(descriptionText.indexOf(skill.Name.toLowerCase()) >= 0)
					{
						state = "description";
						text += "-(d)";
					}
				}
				let badgeTemplate = CreateBadgeTemplate(text, state);
				$(badgesContainer).prepend(badgeTemplate);
				
			}
		}
		// add css to inform the user about the completed operation
		$(offerContainer).addClass('row-completed');
		$(offerContainer).css('background-color', PracujplHelper.data.proccessedColor);
	};
	let data = {
		"Url":url
	};
	$.ajax({
	  headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json' 
      },
	  type: "POST",
	  url: "https://jobhelper.brilliancy.pl/pracujpl",
	  data: JSON.stringify(data),
	  dataType: 'json',
	  success: success
	}).done(function(msg){ 
		PracujplHelper.findRecord();
	})
    .fail(function(xhr, status, error) {
        PracujplHelper.findRecord();
    });
}

//add badges and title to description of the job offer
function AddSkillsToContainer(title,container, skills, className){
			var myContainer = $("<p style=\"width:100%\"></p>");
			$(container).prepend(myContainer);
			myContainer.append($("<p>" + title+":</p>"));
			if(skills)
			{
				for(let skill of skills)
				{
					let text = skill;
					let badgeTemplate = CreateBadgeTemplate(text, className);
					myContainer.append(badgeTemplate);
				}
			}
}

//search for skills description in the given container and tag
function GetSkillsArray(htmlContainer, tag){
		let resultExpectedSkillsContainer = $(htmlContainer).find(tag);
		let skills = [];
		if(resultExpectedSkillsContainer.length > 0)
		{
			let skillsContainer = resultExpectedSkillsContainer.find("[data-test*='text-technology-name']");
			for(let skillContainer of skillsContainer)
			{
				skills.push(skillContainer.innerText);
			}
		}
		return skills;
}

function CreateBadgeTemplate(text, customClass){
	 let badgeTemplate =  $("<span></span>");
		 badgeTemplate.addClass("injected-badge"); 
		 badgeTemplate.text(text);
		 if(customClass){
			  badgeTemplate.addClass(customClass); 
			  if(customClass == "tooltip"){
				  var child =  $("<span></span>");
				  child.addClass("tooltiptext"); 
				  child.text(text);
				  badgeTemplate.append(child);
			  }
		 }
		 return badgeTemplate;
}
	
document.addEventListener('pracujplInjectedEvent', function (e) {
  PracujplHelper.run(e.detail);
});