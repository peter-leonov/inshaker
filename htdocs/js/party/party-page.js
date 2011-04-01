<!--# include virtual="/lib-0.3/core/fixes/keydown-to-keypress.js"-->

;(function(){

<!--# include virtual="party.js" -->

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
	
	var nodes =
	{
		partyName: $('party-name'),
		peopleCount: $$('#cocktail-plan .head .people .count')[0],
		body: $$('#cocktail-plan .body')[0],
		cocktails: $$('#cocktail-plan .body .cocktails')[0]
	}
	
	var widget = new PartyPage()
	widget.bind(nodes)
}

$.onready(onready)
})();
