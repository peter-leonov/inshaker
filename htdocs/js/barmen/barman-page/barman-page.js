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
		
		this.view.findBarmanName()
		
		return this
	},
	
	setCocktails: function ()
	{
		this.controller.setCocktails()
	},
	
	setNextAndPrevBarmen: function ()
	{
		this.controller.setNextAndPrevBarmen()
	}
}

Me.className = 'BarmanPage'
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
		barmanName: $('#head .name'),
		cocktailList: $('.common-content .cocktails'),
		prevBarman: $('#head .arrow.prev'),
		nextBarman: $('#head .arrow.next')
	}
	
	var sources =
	{
		barman: Barman
	}
	
	var page = new BarmanPage()
	page.bind(nodes)
})
