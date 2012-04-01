;(function(){

function Me () {}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		nodes.show.addEventListener('click', function (e) { me.show() }, false)
	},
	
	show: function ()
	{
		var me = this
		
		this.nodes.form.addEventListener('submit', function (e) { me.onsubmit(e) }, false)
		
		var popup = this.popup = new Popup()
		popup.bind(this.nodes.popup)
		popup.addEventListener('hide', function (e) { me.onhide() }, false)
		this.popup.show()
	},
	
	onhide: function ()
	{
		// log('onhide')
		Cookie.set('poll-popup-hidden', Date.now(), Date.add('0'))
	},
	
	maybeShow: function ()
	{
		var hidden = Cookie.get('poll-popup-hidden')
		// log(hidden && new Date(+hidden))
		if (hidden)
			return
		
		this.show()
	},
	
	onsubmit: function (e)
	{
		e.preventDefault()
		
		var hash = FormHelper.toHash(e.target)
		this.poll(hash.answer)
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
		show: $$('#bottom .copyright .poll-show')[0],
		form: $$('#poll-popup .poll-form')[0],
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
