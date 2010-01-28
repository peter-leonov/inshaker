;(function(){

var myName = 'MatchingPage',
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
		
		this.model.init()
		
		return this
	}
}

Object.extend(Me.prototype, myProto)

})();

<!--# include virtual="/lib-0.3/modules/plural.js"-->

<!--# include file="/js/matching/model.js" -->
<!--# include file="/js/matching/view.js" -->
<!--# include file="/js/matching/controller.js" -->

<!--# include virtual="/js/common/theme.js" -->
Theme.bind()

function onready ()
{
	var nodes =
	{
		alphabetical:        $('top-alphabetical'),
		chosenIngeredients:  $('chosen'),
		canPrepare:          $('can-prepare'),
		canPrepareTxt:       $('can-prepare-txt'),
		howMany:             $('how-many'),
		viewCocktails:       $('view-cocktails')
	}
	var widget = new MatchingPage()
	widget.bind(nodes, {ingredient:Ingredient, cocktail:Cocktail}, {selected:{}})
}

$.onready(onready)