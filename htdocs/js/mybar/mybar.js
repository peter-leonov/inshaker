;(function(){

var myName = 'MyBar',
	Me = self[myName] = MVC.create(myName)

var myProto =
{
	bind : function (nodes)
	{
		this.view.bind(nodes)
		this.model.bind()
		this.controller.bind()

		return this
	},

	setMainState : function()
	{
		this.model.setMainState()
	}
}

Object.extend(Me.prototype, myProto)

})();

<!--# include virtual="/lib-0.3/core/fixes/keydown-to-keypress.js"-->

<!--# include virtual="/lib-0.3/modules/json.js" -->
<!--# include virtual="/lib-0.3/modules/motion.js" -->
<!--# include virtual="/lib-0.3/modules/motion-types.js" -->
<!--# include virtual="/lib-0.3/modules/animation.js" -->
<!--# include virtual="/lib-0.3/modules/user-agent.js" -->
<!--# include virtual="/lib-0.3/modules/regexp-escape.js" -->

<!--# include virtual="/lib-0.3/modules/child-indexed-path.js"-->
<!--# include virtual="/lib-0.3/modules/cloner.js"-->

<!--# include virtual="/js/combinator/throttler.js" -->
<!--# include virtual="/js/combinator/popup.js" -->
<!--# include virtual="/js/combinator/ingredient-popup.js" -->

<!--# include virtual="/js/common/bar-storage.js" -->
<!--# include virtual="/js/common/mybar-name.js" -->

<!--# include virtual="/js/common/autocompleter-3.js" -->
<!--# include virtual="/js/common/plain-input-autocompleter.js" -->

<!--# include virtual="/js/cocktails/ingredients-searcher.js" -->
<!--# include virtual="/js/combinator/ingrediented-cocktail-list.js" -->

<!--# include virtual="suspending-rendering.js" -->
<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->

;(function(){

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
	document.documentElement.removeClassName('loading')
	
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
			inBar : $$('#ingredient-info-popup .description .about .in-bar')[0],
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
	
	var nodes = {
		
		barName : {
			wrapper : $('bar-name'),
			tip : $$('#bar-name .tip')[0],
			title : $$('#bar-name h2')[0],
			help : $$('#bar-name h2 .help')[0],
			bName : $$('#bar-name h2 .name')[0],
			form : $$('#bar-name .change-name')[0],
			input : $$('#bar-name .change-name .new-bar-name')[0]
		},
		
		ingredients : {
			list : $$('#output .ingredients-block .list')[0],
			searchForm : $$('#output .ingredients-block .search-box form')[0],
			queryInput : $$('#output .ingredients-block .search-box form .query')[0],
			resetButton: $$('#output .ingredients-block .search-box .reset')[0],
			complete: $$('#output .ingredients-block .search-box .autocomplete')[0],
			switcher : $$('#output .ingredients-block .switcher')[0],
			swList : $$('#output .ingredients-block .switcher .by-list')[0],
			swGroups : $$('#output .ingredients-block .switcher .by-groups')[0],			
			empty : $$('#output .ingredients-block .empty')[0],
			tipIngredient : $$('#output .ingredients-block .tip-ingr')[0]
		},
		
		cocktails : {
			block : $$('#output .cocktails-block')[0],
			amount : $$('#output .cocktails-block .title .amount')[0],
			switcher : $$('#output .cocktails-block .switcher')[0],
			swPhotos : $$('#output .cocktails-block .switcher .photos')[0],
			swCombs : $$('#output .cocktails-block .switcher .combs')[0],
			wrapper : $$('#output .cocktails-block .wrapper')[0],
			empty : $$('#output .cocktails-block .empty')[0]
		},
		
		bottomOutput : {
			output : $$('#output .bottom-output')[0],
			//tagForm : $$('#output .bottom-output .select-tag')[0],
			tagsCloud : $$('#output .bottom-output .tags-cloud')[0],
			selectTag : $$('#output .bottom-output .select-tag .tags')[0],
			title : $$('#output .bottom-output .title')[0],
			wrapper : $$('#output .bottom-output .wrapper')[0],
			empty : $$('#output .bottom-output .empty')[0],
			recommends : $$('#output .bottom-output .recommends')[0],
			mustHave : $$('#output .bottom-output .must-have')[0]
		},
		
		menuLink : $$('#output .cocktails-block .bar-menu-link')[0],
		output : $('output')
	}

	var widget = new MyBar()
	widget.bind(nodes)
}

$.onready(onready)

})();
