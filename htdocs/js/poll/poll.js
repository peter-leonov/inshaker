;(function(){

var Me =
{
	bootstrap: function ()
	{
		var nodes =
		{
			root: document.body,
			popupMain: $('poll-popup'),
			popupParts:
			{
				window: $$('#poll-popup .popup-window')[0],
				front: $$('#poll-popup .popup-front')[0]
			}
		}
		
		var popup = new Popup()
		popup.bind(nodes)
		
		popup.show()
	}
}

function onready ()
{
	Me.bootstrap()
}

$.onready(onready)

})();
