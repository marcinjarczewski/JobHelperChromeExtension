//Declare global variable. Can be used in the console.
JustJoinItHelper ={};

//Init function. Prepares the data and starts searching for rows.
JustJoinItHelper.run = function(inputData){	
	JustJoinItHelper.data = inputData;
	let div = $(".css-1smbjja")[0];
	var leftPanel = div.firstChild;
	leftPanel.style.flex = "0 0 " +JustJoinItHelper.data.leftPanel + '%';
	var rightPanel = div.lastChild;
	rightPanel.style.flex = "0 0 " +JustJoinItHelper.data.rightPanel + '%';
	JustJoinItHelper.findRecord();
}

//Search for lines with job offers
JustJoinItHelper.findRecord = function(){	
	let list = $("a[href*='/offers/']");
	for(let listElem of list)
	{
		
		if(!$(listElem).hasClass("injected"))
		{
		    return JustJoinItHelper.proccessData(listElem);
		};
	}
	
	//if each record was processed, wait 1 second and check again
	setTimeout(function() { JustJoinItHelper.findRecord(); }, 1000);
}

JustJoinItHelper.proccessData = function(siteElement){	
    let url = siteElement.href;
	//mark element as proccessed
	$(siteElement).addClass("injected");
	success = function( result ) {
		//declare some elements based on html structure
	 	let rowContainer = siteElement.firstChild;
		let dataPartContainer = rowContainer.lastChild;
		let secondLineContainer = dataPartContainer.lastChild;
		let firstLineContainer = dataPartContainer.firstChild;
		let titleContainer = firstLineContainer.firstChild;
		let badgesContainer = secondLineContainer.lastChild;
		if(!result){
			return "result error";
		}
		
		//add first line badges
		$(titleContainer).append(CreateBadgeTemplate('Company size:'+result.companySize, "company"));
		if(result.englishEvaluation && result.englishEvaluation.length > 0)
		{
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
		$(rowContainer).addClass('row-completed');
		$(rowContainer).css('background-color', JustJoinItHelper.data.proccessedColor);
	};
	 let data = {
		"Url":url,
		"Skills":JustJoinItHelper.data.skills
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
	}).done(function(msg){ 
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