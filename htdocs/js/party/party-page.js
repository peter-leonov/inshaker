<!--# include virtual="/lib-0.3/core/fixes/keydown-to-keypress.js"-->

;(function(){

<!--# include virtual="party.js" -->

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
	
	var nodes =
	{
		partyName: $('party-name'),
		count: $$('#plan .head .people .count')[0],
		body: $$('#plan .body')[0]
	}
	
	var widget = new PartyPage()
	widget.bind(nodes)
}

$.onready(onready)
})();
