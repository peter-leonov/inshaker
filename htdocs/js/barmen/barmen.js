;(function(){

var myName = 'AllBarmensPage'
var Me = self[myName] = MVC.create(myName)

var myProto =
{
	initialize: function ()
	{
		this.model.initialize()
		this.view.initialize()
		this.controller.initialize()
	},
	
	bind: function (nodes, sources, state)
	{
		this.model.bind(sources)
		this.view.bind(nodes)
		this.controller.bind(state)
		
		this.controller.setBarmenPhoto()
		return this
	}
}

Object.extend(Me.prototype, myProto)

})();

$.onready(function ()
{
	document.documentElement.removeClassName('loading')
	
	var nodes =
	{
		barmensList: $$('.barmen-list')[0]
	}
	
	var sources =
	{
		barmens: Barman.db
	}
	
	var page = new AllBarmensPage()
	
	page.bind(nodes, sources)
})

<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->