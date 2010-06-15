;(function(){

var myName = 'CombinatorPage',
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

<!--# include virtual="/lib-0.3/modules/child-indexed-path.js"-->
<!--# include virtual="/lib-0.3/modules/cloner.js"-->

<!--# include virtual="/lib-0.3/widgets/tab-switcher.js" -->


<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->



;(function(){

function onready ()
{
	var nodes =
	{
	}
	
	var widget = new CombinatorPage()
	widget.bind(nodes, {ingredient:Ingredient, cocktail:Cocktail}, {})
}

$.onready(onready)

})();