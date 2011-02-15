;(function(){

<!--# include virtual="party.js" -->

function onready ()
{
	var nodes =
	{
		count: $$('#plan .head .people .count')[0]
	}
	
	var widget = new PartyPage()
	widget.bind(nodes)
}

$.onready(onready)
})();
