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
<!--# include virtual="ingrediented-cocktail-list.js" -->

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
		
/*		share : {
			getLink : $$('#output .share-bar .get-link')[0],
			foreignBlock : $$('#output .share-bar .foreign-block')[0],
			foreignLink: $$('#output .share-bar .foreign-block a')[0],
			foreignLinkInput : $$('#output .share-bar .foreign-block input')[0]
		},*/

		
/*		barName : {
			wrapper : $('bar-name'),
			tip : $$('#bar-name .tip')[0],
			title : $$('#bar-name h2')[0],
			help : $$('#bar-name h2 .help')[0],
			bName : $$('#bar-name h2 .name')[0],
			form : $$('#bar-name .change-name')[0],
			input : $$('#bar-name .change-name .new-bar-name')[0]
		},*/

		
		mainBox : $$('#common-main-wrapper .main-box')[0],
		
		ingredients : {
			box : $$('#common-main-wrapper .ingredients-box')[0],
			title : {
				barName : $$('#common-main-wrapper .ingredients-box .section-head h2 .bar-name-editable')[0],
				advice : $$('#common-main-wrapper .ingredients-box .section-head h2 .advice')[0]
			},
			list : $$('#common-main-wrapper .ingredients-box .ingredients-list')[0],
			searchForm : $$('#common-main-wrapper .ingredients-box .search-box form')[0],
			queryInput : $$('#common-main-wrapper .ingredients-box .search-box form .query')[0],
			complete: $$('#common-main-wrapper .ingredients-box .search-box .autocomplete')[0],
			luckyButton : $$('#common-main-wrapper .ingredients-box .search-box .lucky-button')[0],
			switcher : $$('#common-main-wrapper .ingredients-box .switcher')[0],
			links : $$('#common-main-wrapper .ingredients-box .section-head .links')[0],
			empty : $$('#common-main-wrapper .ingredients-box .empty-box')[0]
		},
		
		cocktails : {
			box : $$('#common-main-wrapper .cocktails-box')[0],
			wrapper : $$('#common-main-wrapper .cocktails-box .cocktails-wrapper')[0],
			title : {
				h2 : $$('#common-main-wrapper .cocktails-box .section-head h2')[0],
				plural : $$('#common-main-wrapper .cocktails-box .section-head h2 .plural')[0]
			},
			visible : $$('#common-main-wrapper .cocktails-box .cocktails-wrapper .visible-cocktails')[0],
			hidden : $$('#common-main-wrapper .cocktails-box .cocktails-wrapper .hidden-cocktails')[0],
			hiddenList : $$('#common-main-wrapper .cocktails-box .cocktails-wrapper .hidden-cocktails .list')[0],
			switcher : $$('#common-main-wrapper .cocktails-box .switcher')[0],
			links : $$('#common-main-wrapper .cocktails-box .section-head .links')[0],
			empty : $$('#common-main-wrapper .cocktails-box .empty-notice')[0]
		},
		
		share : {
			box : $$('#common-main-wrapper .share-box')[0],
			popup : {
				emailShare : $$('#common-main-wrapper .share-box .email-share-popup')[0],
				webShare : $$('#common-main-wrapper .share-box .web-share-popup')[0]
			}
		},
		
		recommends : {
			box : $$('#common-main-wrapper .recommends-box')[0],
			tags : $$('#common-main-wrapper .recommends-box .tags-wrapper')[0],
			tagsList : $$('#common-main-wrapper .recommends-box .tags-wrapper .tags-list')[0],
			wrapper : $$('#common-main-wrapper .recommends-box .recommends-wrapper')[0],
			recommendsList : $$('#common-main-wrapper .recommends-box .recommends-wrapper .recommends-list')[0],
			mustHaveList : $$('#common-main-wrapper .recommends-box .recommends-wrapper .must-have-list')[0]/*,
						upgradeRecommends : $$('#common-main-wrapper .recommends-box .upgrade-recommends')[0]*/
		}
	}

	var widget = new MyBar()
	widget.bind(nodes)
}

$.onready(onready)

})();
