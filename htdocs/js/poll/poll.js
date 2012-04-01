;(function(){

function Me () {}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		nodes.about.addEventListener('click', function (e) { me.show() }, false)
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
		// log('onhide')
		Cookie.set('poll-popup-hidden', Date.now(), Date.add('5s'))
	},
	
	maybeShow: function ()
	{
		var hidden = Cookie.get('poll-popup-hidden')
		// log(hidden && new Date(+hidden))
		if (hidden)
			return
		
		this.show()
	},
	
	poll: function (value)
	{
		log('poll: ' + value)
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
		about: $$('#bottom .main-menu .link.poll')[0],
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
