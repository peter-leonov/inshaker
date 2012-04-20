<!--# include virtual="/liby/core/fixes/onhashchange.js"-->
<!--# include virtual="/liby/core/fixes/keydown-to-keypress.js"-->

<!--# include virtual="/liby/modules/regexp-escape.js" -->
<!--# include virtual="/liby/modules/url-encode.js" -->
<!--# include virtual="/liby/modules/location-hash.js" -->

<!--# include virtual="/liby/widgets/selecter.js" -->

<!--# include virtual="/js/common/throttler.js" -->
<!--# include virtual="/js/common/autocompleter-3.js" -->
<!--# include virtual="/js/common/adding-input-autocompleter.js" -->
<!--# include virtual="/js/cocktails/ingredients-searcher.js" -->

<!--# include virtual="/js/common/ingredient-popup.js" -->

<!--# include virtual="/js/common/fun-fix.js" -->

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
		output: $('output'),
		mainFunFix: $('the-main-menu'),
		cocktailList: $$('#output .result-block .ingrediented-cocktail-list')[0],
		stats: $$('#output .result-block .stats')[0],
		queryInput: $$('#search-box .query')[0],
		searchForm: $$('#search-box form')[0],
		plusButton: $$('#search-box .plus')[0],
		resetButton: $$('#search-box .reset')[0],
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
	widget.bind(nodes)
}

$.onready(onready)

})();