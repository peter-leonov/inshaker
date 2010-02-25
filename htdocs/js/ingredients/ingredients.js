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

<!--# include virtual="/lib-0.3/modules/array-randomize.js" -->

<!--# include virtual="/lib-0.3/modules/child-indexed-path.js"-->
<!--# include virtual="/lib-0.3/modules/cloner.js"-->
<!--# include virtual="/lib-0.3/modules/gridder.js"-->
<!--# include virtual="/lib-0.3/modules/visibility-frame.js"-->

<!--# include virtual="/lib-0.3/widgets/tab-switcher.js" -->


<!--# include virtual="/js/common/theme.js" -->
Theme.bind()

<!--# include virtual="popup.js" -->
<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->



;(function(){

function onready ()
{
	var nodes =
	{
		main: $$('.b-content')[0],
		output: $('output'),
		
		groupBy: $('group-by'),
		groupByItems: $$('#group-by .item'),
		
		sortBy: $('sort-by'),
		sortByItems: $$('#sort-by .item'),
		
		drawBy: $('draw-by'),
		drawByItems: $$('#draw-by .item'),
		
		ingredientPopupRoot: $('ingredient-info-popup'),
		ingredientPopup:
		{
			window: $$('#ingredient-info-popup .popup-window')[0],
			front: $$('#ingredient-info-popup .popup-front')[0],
			image: $$('#ingredient-info-popup .description .image')[0],
			name: $$('#ingredient-info-popup .description .about .name')[0],
			text: $$('#ingredient-info-popup .description .about .text')[0],
			allLink: $$('#ingredient-info-popup .description .about .all-cocktails a')[0],
			cocktails: $$('#ingredient-info-popup .cocktail-list')[0],
			cocktailsViewport: $$('#ingredient-info-popup .cocktail-list .viewport')[0],
			cocktailsSurface: $$('#ingredient-info-popup .cocktail-list .surface')[0],
			cocktailsPrev: $$('#ingredient-info-popup .cocktail-list .prev')[0],
			cocktailsNext: $$('#ingredient-info-popup .cocktail-list .next')[0]
		}
	}
	
	var widget = new IngredientsPage()
	widget.bind(nodes, {ingredient:Ingredient, cocktail:Cocktail}, {groupBy: 'group', sortBy: 'usage', drawBy: 'with-text'})
}

$.onready(onready)

})();