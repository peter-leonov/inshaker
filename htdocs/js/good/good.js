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
		name: $$('#desc .name')[0],
		previews:
		{
			root: $$('.goods-previews')[0],
			prev: $$('.goods-previews .prev')[0],
			next: $$('.goods-previews .next')[0],
			viewport: $$('.goods-previews .viewport')[0],
			surface: $$('.goods-previews .surface')[0]
		},
		promos:
		{
			root: $$('.good-promos')[0],
			prev: $$('.good-promos .prev')[0],
			next: $$('.good-promos .next')[0],
			viewport: $$('.good-promos .viewport')[0],
			surface: $$('.good-promos .surface')[0]
		}
	}
	
	RoundedCorners.round(nodes.promos.root)
	
	var widget = new GoodPage()
	widget.bind(nodes)
}

$.onready(onready)