;(function(){

var myName = 'GoodPage',
	Me = self[myName] = MVC.create(myName)

// Me.mixIn(EventDriven)

var myProto =
{
	initialize: function ()
	{
		this.model.initialize()
		this.view.initialize()
		this.controller.initialize()
	},

	bind: function (nodes, sources)
	{
		this.model.bind(sources)
		this.view.bind(nodes)
		this.controller.bind()
		
		return this
	}
}

Object.extend(Me.prototype, myProto)

})();


<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->


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
		}
	}
	
	var widget = new GoodPage()
	widget.bind(nodes, {good:Good})
}

$.onready(onready)