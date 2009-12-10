;(function(){

var myName = 'IngredientsPage',
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

	bind: function (nodes, sources, state)
	{
		this.model.bind(sources)
		this.view.bind(nodes)
		this.controller.bind(state)
		
		return this
	}
}

Object.extend(Me.prototype, myProto)

})();

<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->



;(function(){

function onready ()
{
	var nodes =
	{
		main: $$('.b-content')[0],
		output: $('output')
	}
	
	var widget = new IngredientsPage()
	widget.bind(nodes, {ingredient:Ingredient}, {groupBy: 'group', sortBy: 'alphabet'})
}

$.onready(onready)

})();