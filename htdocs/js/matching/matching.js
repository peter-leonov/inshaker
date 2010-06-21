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

	bind: function (nodes, sources)
	{
		this.model.bind(sources)
		this.view.bind(nodes)
		
		this.model.init()
		
		return this
	}
}

Object.extend(Me.prototype, myProto)

})();

<!--# include file="/js/matching/model.js" -->
<!--# include file="/js/matching/view.js" -->
<!--# include file="/js/matching/controller.js" -->

<!--# include virtual="/js/common/theme.js" -->
<!--# config timefmt="%Y.%m" -->
Theme.initialize(<!--# include virtual="/t/theme/$date_local/theme.js" -->)

function onready ()
{
	var nodes =
	{
		main:                $$('.body-wrapper')[0],
		alphabetical:        $('top-alphabetical'),
		
		forExample:          $$('#results .lets-choose .for-example')[0],
		chosenIngeredients:  $$('#results .chosen .ingredients')[0],
		chosenCocktails:     $$('#results .chosen .cocktails-count')[0],
		
		cocktails:
		{
			root:            $$('#results .cocktail-list')[0],
			viewport:        $$('#results .cocktail-list .viewport')[0],
			surface:         $$('#results .cocktail-list .surface')[0],
			prev:            $$('#results .cocktail-list .prev')[0],
			next:            $$('#results .cocktail-list .next')[0]
		}
	}
	var widget = new MatchingPage()
	widget.bind(nodes, {ingredient:Ingredient, cocktail:Cocktail})
}

$.onready(onready)