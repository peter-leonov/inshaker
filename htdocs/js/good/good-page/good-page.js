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
		
		this.view.guessGood()
		
		return this
	}
}

Me.className = 'GoodPage'
self[Me.className] = Papa = Me

})();


<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->


})();


function onready ()
{
	document.documentElement.removeClassName('loading')
	
	var nodes =
	{
		name: $('#desc .name'),
		previews:
		{
			root: $('.goods-previews'),
			prev: $('.goods-previews .prev'),
			next: $('.goods-previews .next'),
			viewport: $('.goods-previews .viewport'),
			surface: $('.goods-previews .surface')
		},
		promos:
		{
			root: $('.good-promos'),
			prev: $('.good-promos .prev'),
			next: $('.good-promos .next'),
			viewport: $('.good-promos .viewport'),
			surface: $('.good-promos .surface')
		}
	}
	
	RoundedCorners.round(nodes.promos.root)
	
	var widget = new GoodPage()
	widget.bind(nodes)
}

$.onready(onready)