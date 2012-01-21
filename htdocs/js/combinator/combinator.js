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

	bind: function (nodes)
	{
		this.view.bind(nodes)
		this.model.bind()
		
		this.view.locationHashUpdated()
		
		return this
	}
}

Object.extend(Me.prototype, myProto)

})();

<!--# include virtual="/lib-0.3/core/fixes/onhashchange.js"-->
<!--# include virtual="/lib-0.3/core/fixes/keydown-to-keypress.js"-->

<!--# include virtual="/lib-0.3/modules/child-indexed-path.js"-->
<!--# include virtual="/lib-0.3/modules/cloner.js"-->
<!--# include virtual="/lib-0.3/modules/regexp-escape.js" -->
<!--# include virtual="/lib-0.3/modules/url-encode.js" -->
<!--# include virtual="/lib-0.3/modules/location-hash.js" -->

<!--# include virtual="/lib-0.3/widgets/selecter.js" -->

<!--# include virtual="/js/common/throttler.js" -->
<!--# include virtual="/js/common/autocompleter-3.js" -->
<!--# include virtual="/js/common/adding-input-autocompleter.js" -->
<!--# include virtual="/js/cocktails/ingredients-searcher.js" -->

<!--# include virtual="/js/common/popup.js" -->
<!--# include virtual="/js/common/ingredient-popup.js" -->

<!--# include virtual="/js/common/fun-fix.js" -->

<!--# include virtual="ingrediented-cocktail-list.js" -->
<!--# include virtual="ingredients-list.js" -->
<!--# include virtual="query-parser.js" -->
<!--# include virtual="tokenizer.js" -->
<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->



;(function(){

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
	
	IngredientPopup.bootstrap()
	
	
	var nodes =
	{
		output: $('output'),
		mainFunFix: $('main-fun-fix'),
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