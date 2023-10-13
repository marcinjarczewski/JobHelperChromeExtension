//Declare global variable. Can be used in the console.
JustJoinItHelper ={};

//Init function. Prepares the data and starts searching for rows.
JustJoinItHelper.run = function(inputData){	
	JustJoinItHelper.data = inputData;
	let leftPanel = $(".css-1fmajlu")[0];
	leftPanel.style.flex = "0 0 " +JustJoinItHelper.data.leftPanel + '%';
	let rightPanel = $(".css-120r7wt")[0];
	rightPanel.style.flex = "0 0 " +JustJoinItHelper.data.rightPanel + '%';
	JustJoinItHelper.findRecord();
}

//Search for lines with job offers
JustJoinItHelper.findRecord = function(){	
	let list = $("a[href*='/offers/']");
	for(let listElem of list)
	{
		
		if (!$(listElem).parent().hasClass("injected"))
		{
		    return JustJoinItHelper.proccessData(listElem);
		};
	}
	
	//if each record was processed, wait 1 second and check again
	setTimeout(function() { JustJoinItHelper.findRecord(); }, 1000);
}

JustJoinItHelper.proccessData = function (siteElement) {
    let url = siteElement.href;
	let mainContainer = $(siteElement).parent()[0];
	//mark element as proccessed
	$(siteElement).parent().addClass("injected");
	success = function (result) {
		//declare some elements based on html structure
	 	let rowContainer = mainContainer.lastChild;
		let dataPartContainer = rowContainer.lastChild;
		let secondLineContainer = dataPartContainer.lastChild;
		let firstLineContainer = dataPartContainer.firstChild;
		let titleContainer = rowContainer.firstChild;
		let badgesContainer = secondLineContainer;
		if(!result){
			return "result error";
		}
		
		//add first line badges
		$(titleContainer).append(CreateBadgeTemplate('Company size:'+result.companySize, "company"));
		if(result.englishEvaluation && result.englishEvaluation.length > 0)
		{
			debugger;
			$(titleContainer).append(CreateBadgeTemplate('language eval.:'+result.englishEvaluation, "tooltip"));
		}
		$(titleContainer).append(CreateBadgeTemplate('offer language:'+result.offerLanguage, "company"));
		if(JustJoinItHelper.data.removeOldBadges)
		{
		   $(badgesContainer).children().remove();
		}
		
		//set skill level with level (if found)
		if(result.skills){
			for(let skill of result.skills)
			{
				let state  = "none";
				let text = skill.name;
				if(skill.level){
					state = "success";
					text += "-" + skill.level;
				} 
				else if(skill.isInDescription){
					state = "description";
					text += "-(d)";
				}
				let badgeTemplate = CreateBadgeTemplate(text, state);
				$(badgesContainer).prepend(badgeTemplate);
			}
		}
		// add css to inform the user about the completed operation
		$(mainContainer).addClass('row-completed');
		$(mainContainer).css('background-color', JustJoinItHelper.data.proccessedColor);
		if(result.offerLanguage.toLowerCase() == 'english'){
			$(siteElement).parent().hide();
		}
	};
	 let data = {
		"Url":url,
		"Skills": JustJoinItHelper.data.skills,
		"ApiKey": JustJoinItHelper.data.apiKey
	};
	$.ajax({
	  headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json' 
      },
	  type: "POST",
	  url: "https://jobhelper.brilliancy.pl/justJoinIt",
	  data: JSON.stringify(data),
	  dataType: 'json',
	  success: success
	}).done(function (msg) {
		JustJoinItHelper.findRecord();
	})
    .fail(function(xhr, status, error) {
		JustJoinItHelper.findRecord();
    });
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
	
document.addEventListener('justJoinItInjectedEvent', function (e) {
  JustJoinItHelper.run(e.detail);
});