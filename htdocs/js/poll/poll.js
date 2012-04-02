<!--# include virtual="/liby/modules/date.js"-->
<!--# include virtual="/liby/modules/cookie.js"-->
<!--# include virtual="/liby/modules/form-helper.js"-->

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
		this.nodes.form.addEventListener('change', function (e) { me.onchange(e) }, false)
		this.nodes.form.addEventListener('click', function (e) { me.onchange(e) }, false)
		
		var popup = this.popup = new Popup()
		popup.bind(this.nodes.popup)
		popup.addEventListener('hide', function (e) { me.hide() }, false)
		popup.addEventListener('ui-hide', function (e) { me.hideFromUI() }, false)
		this.popup.show()
	},
	
	hide: function ()
	{
		Cookie.set('poll-popup-hidden', Date.now(), Date.add('10d'))
	},
	
	hideFromUI: function ()
	{
		this.poll('hide')
		this.hide()
	},
	
	maybeShow: function ()
	{
		var hidden = Cookie.get('poll-popup-hidden')
		if (hidden)
			return
		
		this.show()
	},
	
	onchange: function ()
	{
		this.nodes.button.disabled = false
	},
	
	onsubmit: function (e)
	{
		e.preventDefault()
		
		var answer = FormHelper.toHash(e.target).answer
		this.poll(answer)
		
		this.nodes.root.addClassName('done')
		
		var popup = this.popup
		window.setTimeout(function () { popup.hide() }, 1000)
	},
	
	poll: function (value)
	{
		Statistics.poll('frequency-of-making-cocktails-at-home', value)
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
		root: $$('#poll-popup .poll-window')[0],
		form: $$('#poll-popup .poll-form')[0],
		button: $$('#poll-popup .poll-form button')[0],
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
