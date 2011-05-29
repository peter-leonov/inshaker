;(function(){

var myName = 'Foreign',
	Me = self[myName] = MVC.create(myName)

var myProto =
{
	bind : function (nodes)
	{
		this.view.bind(nodes)
		this.model.bind()
		this.controller.bind()
	},
	
	setMainState : function()
	{
		this.model.setMainState()
	}
}

Object.extend(Me.prototype, myProto)

})();

<!--# include virtual="/lib-0.3/modules/child-indexed-path.js"-->
<!--# include virtual="/lib-0.3/modules/cloner.js"-->

<!--# include virtual="/lib-0.3/modules/user-agent.js" -->
<!--# include virtual="/lib-0.3/modules/regexp-escape.js" -->

<!--# include virtual="/lib-0.3/modules/child-indexed-path.js"-->
<!--# include virtual="/lib-0.3/modules/cloner.js"-->

<!--# include virtual="/js/common/bar-storage.js" -->

<!--# include virtual="/js/combinator/popup.js" -->
<!--# include virtual="/js/combinator/ingredient-popup.js" -->

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
		root : document.body,
		popupMain : $('ingredient-info-popup'),
		popupParts :
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
	
	var nodes = 
	{
		title : $$('head title')[0],
		
		mainBox : $$('#common-main-wrapper .main-box')[0],
		
		ingredients : {
			box : $$('#common-main-wrapper .ingredients-box')[0],
			barName : $$('#common-main-wrapper .ingredients-box .section-head h2 .bar-name')[0],
			list : $$('#common-main-wrapper .ingredients-box .ingredients-list')[0],
			empty : $$('#common-main-wrapper .ingredients-box .empty-notice')[0]
		},
		
		cocktails : {
			box : $$('#common-main-wrapper .cocktails-box')[0],
			title : {
				h2 : $$('#common-main-wrapper .cocktails-box .section-head h2')[0],
				plural : $$('#common-main-wrapper .cocktails-box .section-head h2 .plural')[0]
			},
			list : $$('#common-main-wrapper .cocktails-box .cocktails-wrapper .cocktails-list')[0],
			empty : $$('#common-main-wrapper .cocktails-box .empty-notice')[0]
		},
		
		failBox : $$('#common-main-wrapper .fail-box')[0],
		mybarLinkBox : $$('#common-main-wrapper .mybar-link-box')[0]
	}
	
	var widget = new Foreign()
	widget.bind(nodes)
}

$.onready(onready)

})();