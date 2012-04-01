;(function(){

function Me () {}

Me.prototype =
{
	bind: function (nodes)
	{
		var popup = new Popup()
		popup.bind(nodes)
		
		popup.show()
	}
}

Me.className = 'PollPopup'
self[Me.className] = Me

})();


;(function(){

function onready ()
{
	var nodes =
	{
		root: $('poll-popup'),
		window: $$('#poll-popup .popup-window')[0],
		front: $$('#poll-popup .popup-front')[0]
	}
	
	var widget = new PollPopup()
	widget.bind(nodes)
}

$.onready(onready)

})();
