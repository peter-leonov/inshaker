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
		this.view.bind(nodes)
		this.model.bind(sources)
		this.controller.bind(state)
		
		this.view.getValue()
		
		return this
	}
}

Object.extend(Me.prototype, myProto)

})();

<!--# include virtual="/lib-0.3/modules/child-indexed-path.js"-->
<!--# include virtual="/lib-0.3/modules/cloner.js"-->
<!--# include virtual="/lib-0.3/modules/regexp-escape.js" -->

<!--# include virtual="/lib-0.3/widgets/tab-switcher.js" -->

<!--# include virtual="/js/common/autocompleter-3.js" -->
<!--# include virtual="/js/cocktails/searcher.js" -->

<!--# include virtual="ingrediented-cocktail-list.js" -->
<!--# include virtual="throttler.js" -->
<!--# include virtual="query-parser.js" -->
<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->



;(function(){

function onready ()
{
	var nodes =
	{
		output: $('output'),
		ingredientInput: $$('#search-box .ingredient')[0],
		ingredientComplete: $$('#search-box .autocomplete')[0]
	}
	
	var widget = new CombinatorPage()
	widget.bind(nodes, {ingredient:Ingredient, cocktail:Cocktail}, {})
}

$.onready(onready)

})();