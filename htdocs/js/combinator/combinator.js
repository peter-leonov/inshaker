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
		
		this.view.locationHashUpdated()
		
		return this
	}
}

Object.extend(Me.prototype, myProto)

})();

<!--# include virtual="/lib-0.3/core/fixes/onhashchange.js"-->

<!--# include virtual="/lib-0.3/modules/child-indexed-path.js"-->
<!--# include virtual="/lib-0.3/modules/cloner.js"-->
<!--# include virtual="/lib-0.3/modules/regexp-escape.js" -->
<!--# include virtual="/lib-0.3/modules/url-encode.js" -->
<!--# include virtual="/lib-0.3/modules/location-hash.js" -->

<!--# include virtual="/lib-0.3/widgets/selecter.js" -->

<!--# include virtual="/js/common/autocompleter-3.js" -->
<!--# include virtual="/js/common/adding-input-autocompleter.js" -->
<!--# include virtual="/js/cocktails/searcher.js" -->

<!--# include virtual="ingrediented-cocktail-list.js" -->
<!--# include virtual="ingredients-list.js" -->
<!--# include virtual="popup.js" -->
<!--# include virtual="ingredient-popup.js" -->
<!--# include virtual="throttler.js" -->
<!--# include virtual="query-parser.js" -->
<!--# include virtual="tokenizer.js" -->
<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->



;(function(){

function onready ()
{
	var nodes =
	{
		root: document.body,
		popupMain: $('ingredient-info-popup'),
		popupParts:
		{
			window: $$('#ingredient-info-popup .popup-window')[0],
			front: $$('#ingredient-info-popup .popup-front')[0],
			ingredientWindow: $$('#ingredient-info-popup .popup-window .ingredient-window')[0],
			image: $$('#ingredient-info-popup .description .image')[0],
			mark: $$('#ingredient-info-popup .description .about .mark')[0],
			brand: $$('#ingredient-info-popup .description .about .brand .link')[0],
			buy: $$('#ingredient-info-popup .description .about .where-to-buy .link')[0],
			name: $$('#ingredient-info-popup .description .about .name')[0],
			text: $$('#ingredient-info-popup .description .about .text')[0],
			allCocktails: $$('#ingredient-info-popup .description .about .all-cocktails')[0],
			allCocktailsLink: $$('#ingredient-info-popup .description .about .all-cocktails .link')[0],
			combinations: $$('#ingredient-info-popup .description .about .combinations')[0],
			combinationsList: $$('#ingredient-info-popup .description .about .combinations .list')[0],
			cocktails: $$('#ingredient-info-popup .cocktail-list')[0],
			cocktailsViewport: $$('#ingredient-info-popup .cocktail-list .viewport')[0],
			cocktailsSurface: $$('#ingredient-info-popup .cocktail-list .surface')[0],
			cocktailsPrev: $$('#ingredient-info-popup .cocktail-list .prev')[0],
			cocktailsNext: $$('#ingredient-info-popup .cocktail-list .next')[0]
		}
	}
	
	IngredientPopup.setup(nodes)
	
	Ingredient.calculateEachIngredientUsage()
	
	
	var nodes =
	{
		output: $('output'),
		cocktailList: $$('#output .result-block .ingrediented-cocktail-list')[0],
		queryInput: $$('#search-box .query')[0],
		searchForm: $$('#search-box form')[0],
		searchButton: $$('#search-box .search')[0],
		ingredientComplete: $$('#search-box .autocomplete')[0],
		totalCocktails: $$('#output .sort-line .cocktail-count')[0],
		sortedWord: $$('#output .sort-line .sorted-word')[0],
		suggestions: $$('#output .empty-block .suggestions')[0],
		suggestionsList: $$('#output .empty-block .suggestions .list')[0],
		ingredientsList: $$('#output .initial-block .ingredients-list')[0],
		helpLine: $$('#output .help-line')[0],
		hintSingle: $$('#output .help-line .hint.single')[0],
		hintDouble: $$('#output .help-line .hint.double')[0],
		
		sortbySelect:
		{
			main: $('sortby-select'),
			button: $$('#sortby-select .button')[0],
			options: $$('#sortby-select .options')[0]
		}
	}
	
	var widget = new CombinatorPage()
	widget.bind(nodes, {ingredient:Ingredient, cocktail:Cocktail}, {})
}

$.onready(onready)

})();