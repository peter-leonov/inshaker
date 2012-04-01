;(function(){

function Me () {}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
	},
	
	show: function ()
	{
		var popup = this.popup = new Popup()
		popup.bind(this.nodes.popup)
		
		var me = this
		popup.addEventListener('hide', function (e) { me.onhide() }, false)
		
		this.popup.show()
	},
	
	onhide: function ()
	{
		log('hide')
	},
	
	maybeShow: function ()
	{
		this.show()
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
		popup:
		{
			root: $('poll-popup'),
			window: $$('#poll-popup .popup-window')[0],
			front: $$('#poll-popup .popup-front')[0]
		}
	}
	
	var widget = new PollPopup()
	widget.bind(nodes)
	
	widget.maybeShow()
}

$.onready(onready)

})();
