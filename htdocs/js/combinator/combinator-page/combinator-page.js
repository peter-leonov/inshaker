<!--# include virtual="/liby/core/fixes/onhashchange.js"-->
<!--# include virtual="/liby/core/fixes/keydown-to-keypress.js"-->

<!--# include virtual="/liby/modules/regexp-escape.js" -->
<!--# include virtual="/liby/modules/location-hash.js" -->

<!--# include virtual="/liby/widgets/selecter.js" -->

<!--# include virtual="/js/common/autocompleter-3.js" -->
<!--# include virtual="/js/cocktails/ingredients-searcher.js" -->

<!--# include virtual="/js/common/ingredient-popup.js" -->

<!--# include virtual="/js/common/fun-fix.js" -->

<!--# include virtual="/js/combinator/adding-input-autocompleter.js" -->
<!--# include virtual="/js/combinator/ingrediented-cocktail-list.js" -->
<!--# include virtual="/js/combinator/ingredients-list.js" -->
<!--# include virtual="/js/combinator/query-parser.js" -->
<!--# include virtual="/js/combinator/tokenizer.js" -->


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
		this.model.bind()
		
		this.view.locationHashUpdated()
		
		return this
	}
}

Me.className = 'CombinatorPage'
self[Me.className] = Papa = Me

})();


<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->


})();


;(function(){

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
	
	IngredientPopup.bootstrap()
	
	
	var nodes =
	{
		output: $('#output'),
		mainFunFix: $('#the-main-menu'),
		cocktailList: $('#output .result-block .ingrediented-cocktail-list'),
		stats: $('#output .result-block .stats'),
		queryInput: $('#search-box .query'),
		searchForm: $('#search-box form'),
		plusButton: $('#search-box .plus'),
		resetButton: $('#search-box .reset'),
		ingredientComplete: $('#search-box .autocomplete'),
		totalCocktails: $('#output .sort-line .cocktail-count'),
		sortedWord: $('#output .sort-line .sorted-word'),
		suggestions: $('#output .empty-block .suggestions'),
		suggestionsList: $('#output .empty-block .suggestions .list'),
		ingredientsList: $('#output .initial-block .ingredients-list'),
		helpLine: $('#output .help-line'),
		hintSingle: $('#output .help-line .hint.single'),
		hintDouble: $('#output .help-line .hint.double'),
		
		sortbySelect:
		{
			main: $('#sortby-select'),
			button: $('#sortby-select .button'),
			options: $('#sortby-select .options')
		}
	}
	
	var widget = new CombinatorPage()
	widget.bind(nodes)
}

$.onready(onready)

})();