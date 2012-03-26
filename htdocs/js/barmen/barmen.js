;(function(){

var Papa

;(function(){

function Me ()
{
	var m = this.model = new Me.Model(),
		v = this.view = new Me.View(),
		c = this.controller = new Me.Controller()
	
	m.view = v
	v.controller = c
	c.model = m
	
	m.parent = v.parent = c.parent = this
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.view.bind(nodes)
		
		this.controller.loadBarmen()
		
		return this
	}
}

Me.className = 'BarmenPage'
self[Me.className] = Papa = Me

})();


<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->


})();


$.onready(function ()
{
	document.documentElement.removeClassName('loading')
	
	var nodes =
	{
		barmensList: $$('.barmen-list')[0]
	}
	
	var page = new BarmenPage()
	page.bind(nodes)
})
